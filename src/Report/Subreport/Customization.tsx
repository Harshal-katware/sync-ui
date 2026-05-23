import { useState, type ChangeEvent } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getCustomReport } from "../../Api/reportApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLang } from "../../context/languageContext";

type PaymentType = "all" | "CASH" | "UPI" | "CARD" | "ONLINE";
type OrderType = "all" | "dine-in" | "takeaway" | "online";

interface DataItem {
  name: string;
  qty: number;
  revenue: number;
  payment: string;
  type: string;
}

interface CustomResult {
  items: DataItem[];
  totalSales: number;
  totalQty: number;
  topProduct: string;
}

export default function Customization() {
  const { t } = useLang();

  const [payment, setPayment] = useState<PaymentType>("all");
  const [orderType, setOrderType] = useState<OrderType>("all");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CustomResult | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getCustomReport({
        payment: payment === "all" ? undefined : payment,
        orderType: orderType === "all" ? undefined : orderType,
      });

      setResult(res);
      setShow(true);
    } catch {
      setError(t("rep.custom.error"));
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setPayment("all");
    setOrderType("all");
    setShow(false);
    setResult(null);
    setError("");
  };

  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(t("rep.custom.title"), 14, 20);

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Payment: ${payment.toUpperCase()}`, 14, 38);
    doc.text(`Order Type: ${orderType}`, 14, 46);

    autoTable(doc, {
      startY: 55,
      head: [["Summary", "Value"]],
      body: [
        [t("rep.custom.totalSales"), `Rs. ${result.totalSales}`],
        [t("rep.custom.itemsSold"),  `${result.totalQty}`],
        [t("rep.custom.topProduct"), `${result.topProduct}`],
      ],
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 70;

    autoTable(doc, {
      startY: finalY + 10,
      head: [[
        t("rep.custom.item"),
        t("rep.custom.qty"),
        t("rep.custom.revenue"),
        t("rep.custom.payment"),
        t("rep.custom.type"),
      ]],
      body: result.items.length
        ? result.items.map((item) => [
            item.name,
            item.qty,
            `Rs. ${item.revenue}`,
            item.payment,
            item.type,
          ])
        : [[t("rep.custom.noData"), "-", "-", "-", "-"]],
    });

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Generated automatically", 14, 285);
    doc.save("custom-report.pdf");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {t("rep.custom.title")}
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          {t("rep.custom.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={payment}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setPayment(e.target.value as PaymentType)
            }
            className="bg-gray-100 border p-3 rounded-lg w-full"
          >
            <option value="all">{t("rep.custom.allPayments")}</option>
            <option value="CASH">{t("rep.custom.cash")}</option>
            <option value="UPI">{t("rep.custom.upi")}</option>
            <option value="CARD">{t("rep.custom.card")}</option>
            <option value="ONLINE">{t("rep.custom.online")}</option>
          </select>

          <select
            value={orderType}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setOrderType(e.target.value as OrderType)
            }
            className="bg-gray-100 border p-3 rounded-lg w-full"
          >
            <option value="all">{t("rep.custom.allOrders")}</option>
            <option value="dine-in">{t("rep.custom.dineIn")}</option>
            <option value="takeaway">{t("rep.custom.takeaway")}</option>
            <option value="online">{t("rep.custom.online")}</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 text-white rounded-lg disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #0d4a3a, #1a6b52)" }}
          >
            {loading ? t("rep.custom.loading") : t("rep.custom.generate")}
          </button>

          <button
            onClick={resetFilters}
            className="w-full sm:w-auto px-6 py-2 bg-gray-400 text-white rounded-lg"
          >
            {t("rep.custom.reset")}
          </button>

          {show && result && (
            <button
              onClick={downloadPDF}
              className="w-full sm:w-auto px-6 py-2 text-white rounded-lg shadow transition"
              style={{ background: "linear-gradient(135deg, #0d4a3a, #1a6b52)" }}
            >
              {t("rep.custom.download")}
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm">⚠ {error}</p>
        )}
      </div>

      {/* Result */}
      {show && result && (
        <>
          {result.items.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              {t("rep.custom.noData")}
            </div>
          ) : (
            <>
              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-100 p-5 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-600">{t("rep.custom.totalSales")}</p>
                  <h2 className="font-bold text-lg text-gray-800">₹{result.totalSales}</h2>
                </div>

                <div className="bg-gray-100 p-5 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-600">{t("rep.custom.itemsSold")}</p>
                  <h2 className="font-bold text-lg text-gray-800">{result.totalQty}</h2>
                </div>

                <div className="text-white p-5 rounded-xl shadow" style={{ background: "linear-gradient(135deg, #0d4a3a, #1a6b52)" }}>
                  <p className="text-sm">{t("rep.custom.topProduct")}</p>
                  <h2 className="font-bold text-lg">{result.topProduct}</h2>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-sm">
                <p className="mb-3 font-semibold">{t("rep.custom.salesChart")}</p>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.items}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={false} />
                    <Bar dataKey="revenue" fill="#0d4a3a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="bg-gray-100 rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-sm min-w-150">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-3 text-left">{t("rep.custom.item")}</th>
                      <th className="p-3 text-left">{t("rep.custom.qty")}</th>
                      <th className="p-3 text-left">{t("rep.custom.revenue")}</th>
                      <th className="p-3 text-left">{t("rep.custom.payment")}</th>
                      <th className="p-3 text-left">{t("rep.custom.type")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.items.map((item, i) => (
                      <tr key={i} className="border-t hover:bg-gray-200 transition">
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.qty}</td>
                        <td className="p-3 font-medium" style={{ color: "#1a6b52" }}>₹{item.revenue}</td>
                        <td className="p-3">{item.payment}</td>
                        <td className="p-3 capitalize">{item.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}