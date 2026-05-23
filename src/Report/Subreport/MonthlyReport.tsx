import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { getMonthlyReport } from "../../Api/reportApi";
import { useLang } from "../../context/languageContext";

interface TopItem {
  name: string;
  qty: number;
}

interface PaymentData {
  cash: number;
  upi: number;
  card: number;
  online: number;
}

interface ReportData {
  totalSales: number;
  discount: number;
  refund: number;
  netSales: number;
  orders: number;
  avgOrder: number;
  payment: PaymentData;
  topItems: TopItem[];
}

interface PieEntry {
  name: string;
  value: number;
}

const COLORS = [
  "#0d4a3a",
  "#1a6b52",
  "#2d9970",
  "#f59e0b",
];

export default function MonthlyReport(): React.ReactNode {
  const { t } = useLang();

  const today = new Date();

  const monthName = today.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const [data, setData] = useState<ReportData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    getMonthlyReport()
      .then(setData)
      .catch(() => setError(t("rep.monthly.error")))
      .finally(() => setLoading(false));
  }, []);

  const netSales = data?.netSales ?? 0;

  const pieData: PieEntry[] = data?.payment
    ? Object.entries(data.payment)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: key.toUpperCase(),
          value,
        }))
    : [];

  // PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(t("rep.monthly.title"), 14, 20);

    doc.setFontSize(12);

    doc.text(`Month: ${monthName}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Metric", "Value"]],
      body: [
        [t("rep.monthly.totalSales"), `Rs. ${data?.totalSales ?? 0}`],
        [t("rep.monthly.discount"),   `Rs. ${data?.discount ?? 0}`],
        [t("rep.monthly.refund"),     `Rs. ${data?.refund ?? 0}`],
        [t("rep.monthly.netSales"),   `Rs. ${netSales}`],
        [t("rep.monthly.orders"),     `${data?.orders ?? 0}`],
        [t("rep.monthly.avgOrder"),   `Rs. ${data?.avgOrder ?? 0}`],
      ],
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    autoTable(doc, {
      startY: finalY + 10,
      head: [[t("rep.top.product"), t("rep.top.qty")]],
      body:
        data?.topItems?.length
          ? data.topItems.map((item) => [item.name, item.qty])
          : [[t("rep.monthly.noDataMonth"), "-"]],
    });

    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 280);
    doc.save("monthly-report.pdf");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: "#1a6b52", borderTopColor: "transparent" }} />
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
        ⚠ {error}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-serif text-gray-800">
          {t("rep.monthly.title")}
        </h1>
        <p className="text-gray-500">{monthName}</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-100 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">{t("rep.monthly.totalSales")}</p>
          <h2 className="font-bold text-gray-800">₹{data?.totalSales ?? 0}</h2>
        </div>

        <div className="bg-gray-100 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">{t("rep.monthly.discount")}</p>
          <h2 className="text-yellow-600 font-bold">₹{data?.discount ?? 0}</h2>
        </div>

        <div className="bg-gray-100 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">{t("rep.monthly.refund")}</p>
          <h2 className="text-red-500 font-bold">₹{data?.refund ?? 0}</h2>
        </div>

        <div className="text-white p-5 rounded-xl shadow" style={{ background: "linear-gradient(135deg, #0d4a3a, #1a6b52)" }}>
          <p className="text-sm">{t("rep.monthly.netSales")}</p>
          <h2 className="font-bold">₹{netSales}</h2>
        </div>
      </div>

      {/* Orders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-100 p-5 rounded-xl shadow-sm">
          {t("rep.monthly.orders")}: <b>{data?.orders ?? 0}</b>
        </div>
        <div className="bg-gray-100 p-5 rounded-xl shadow-sm">
          {t("rep.monthly.avgOrder")}: <b>₹{data?.avgOrder ?? 0}</b>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-sm">
          <p className="mb-3 font-semibold">{t("rep.monthly.topProducts")}</p>

          {(data?.topItems?.length ?? 0) === 0 ? (
            <p className="text-center text-gray-400 py-10">
              {t("rep.monthly.noDataMonth")}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.topItems ?? []}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={false} />
                <Bar dataKey="qty" fill="#0d4a3a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-sm">
          <p className="mb-3 font-semibold">{t("rep.monthly.paymentMethods")}</p>

          {pieData.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              {t("rep.monthly.noPaymentData")}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadPDF}
        className="px-6 py-2 text-white rounded-lg shadow hover:scale-105 transition"
        style={{ background: "linear-gradient(135deg, #0d4a3a, #1a6b52)" }}
      >
        {t("rep.monthly.download")}
      </button>
    </div>
  );
}