import { useState, type ChangeEvent } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getCustomReport } from "../../Api/reportApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
      setError("Failed to load report.");
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

  // ✅ PDF FUNCTION
  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Custom Sales Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    doc.text(`Payment: ${payment.toUpperCase()}`, 14, 38);
    doc.text(`Order Type: ${orderType}`, 14, 46);

    autoTable(doc, {
      startY: 55,
      head: [["Summary", "Value"]],
      body: [
        ["Total Sales", `Rs. ${result.totalSales}`],
        ["Items Sold", `${result.totalQty}`],
        ["Top Product", `${result.topProduct}`],
      ],
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 70;

    autoTable(doc, {
      startY: finalY + 10,
      head: [["Item", "Qty", "Revenue", "Payment", "Type"]],
      body: result.items.length
        ? result.items.map((item) => [
            item.name,
            item.qty,
            `Rs. ${item.revenue}`,
            item.payment,
            item.type,
          ])
        : [["No Data", "-", "-", "-", "-"]],
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Custom Report</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Filter and generate your own report
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
            <option value="all">All Payments</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="ONLINE">Online</option>
          </select>

          <select
            value={orderType}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setOrderType(e.target.value as OrderType)
            }
            className="bg-gray-100 border p-3 rounded-lg w-full"
          >
            <option value="all">All Orders</option>
            <option value="dine-in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
            <option value="online">Online</option>
          </select>
        </div>

        {/* ✅ BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Generate"}
          </button>

          <button
            onClick={resetFilters}
            className="w-full sm:w-auto px-6 py-2 bg-gray-400 text-white rounded-lg"
          >
            Reset
          </button>

          {/* ✅ DOWNLOAD BUTTON ADDED */}
          {show && result && (
            <button
              onClick={downloadPDF}
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg shadow  transition"
            >
              📄 Download Report
            </button>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">⚠ {error}</p>}
      </div>

      {/* Result */}
      {show && result && (
        <>
          {result.items.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              No data found ❌
            </div>
          ) : (
            <>
              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <h2 className="font-bold text-lg">₹{result.totalSales}</h2>
                </div>
                <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-600">Items Sold</p>
                  <h2 className="font-bold text-lg">{result.totalQty}</h2>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-5 rounded-xl shadow">
                  <p className="text-sm">Top Product</p>
                  <h2 className="font-bold text-lg">{result.topProduct}</h2>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
                <p className="mb-3 font-semibold">Sales Chart</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.items}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={false} />
                    <Bar dataKey="revenue" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="bg-gray-200 rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-sm min-w-150">
                  <thead className="bg-gray-300">
                    <tr>
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-left">Qty</th>
                      <th className="p-3 text-left">Revenue</th>
                      <th className="p-3 text-left">Payment</th>
                      <th className="p-3 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item, i) => (
                      <tr key={i} className="border-t hover:bg-gray-300 transition">
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.qty}</td>
                        <td className="p-3 text-green-600">₹{item.revenue}</td>
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