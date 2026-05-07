import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getDailyReport } from "../../Api/reportApi";
import { useLang } from "../../context/languageContext";

interface Product {
  name: string;
  qty: number;
  revenue: number;
}

interface DailyData {
  totalSales: number;
  discount: number;
  refund: number;
  gst: number;
  netSales: number;
  orders: number;
  avgOrder: number;
  products: Product[];
  date: string;
}

export default function DailyUpdate() {
  const { t } = useLang();
  const today = new Date().toLocaleDateString();
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDailyReport()
      .then(setData)
      .catch(() => setError(t("rep.daily.error")))
      .finally(() => setLoading(false));
  }, []);

  const topProduct = data?.products?.[0]?.name ?? "-";

  const chartData = data?.products?.map((p) => ({
    time: p.name,
    sales: p.revenue,
  })) ?? [];

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Daily Sales Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${today}`, 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [["Metric", "Value"]],
      body: [
        ["Total Sales",  `Rs. ${data?.totalSales ?? 0}`],
        ["Discount",     `Rs. ${data?.discount ?? 0}`],
        ["Refund",       `Rs. ${data?.refund ?? 0}`],
        ["GST",          `Rs. ${data?.gst ?? 0}`],
        ["Net Sales",    `Rs. ${data?.netSales ?? 0}`],
        ["Orders",       `${data?.orders ?? 0}`],
        ["Avg Order",    `Rs. ${data?.avgOrder ?? 0}`],
      ],
    });
    const finalY = (doc as any).lastAutoTable?.finalY || 60;
    autoTable(doc, {
      startY: finalY + 10,
      head: [["Product", "Qty", "Revenue"]],
      body: data?.products?.length
        ? data.products.map((p) => [p.name, p.qty, `Rs. ${p.revenue}`])
        : [["No Data", "-", "-"]],
    });
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 285);
    doc.save("daily-report.pdf");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">⚠ {error}</div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif text-gray-800">{t("rep.daily.title")}</h1>
          <p className="text-sm sm:text-base text-gray-700">{today}</p>
        </div>
        <button
          onClick={downloadPDF}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg shadow hover:scale-105 transition"
        >
          {t("rep.daily.export")}
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-200 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-800">{t("rep.daily.totalSales")}</p>
          <h2 className="text-lg sm:text-xl font-bold">₹{data?.totalSales ?? 0}</h2>
        </div>
        <div className="bg-gray-200 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-800">{t("rep.daily.discount")}</p>
          <h2 className="text-lg sm:text-xl font-bold text-yellow-600">₹{data?.discount ?? 0}</h2>
        </div>
        <div className="bg-gray-200 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-800">{t("rep.daily.orders")}</p>
          <h2 className="text-lg sm:text-xl font-bold text-blue-600">{data?.orders ?? 0}</h2>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 sm:p-5 rounded-xl shadow">
          <p className="text-sm">{t("rep.daily.netSales")}</p>
          <h2 className="text-lg sm:text-xl font-bold">₹{data?.netSales ?? 0}</h2>
        </div>
      </div>

      {/* Orders row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-200 p-4 sm:p-5 rounded-xl shadow-sm">
          {t("rep.daily.orders")}: <b>{data?.orders ?? 0}</b>
        </div>
        <div className="bg-gray-200 p-4 sm:p-5 rounded-xl shadow-sm">
          {t("rep.daily.avgOrder")}: <b>₹{data?.avgOrder ?? 0}</b>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
          <p className="mb-3 font-semibold">{t("rep.daily.revenueByProduct")}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold">{t("rep.daily.topProducts")}</p>
          <span className="text-sm text-gray-800">{t("rep.daily.today")}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[300px]">
            <thead className="bg-gray-300">
              <tr>
                <th className="p-3 text-left">{t("rep.daily.product")}</th>
                <th className="p-3 text-left">{t("rep.daily.qty")}</th>
                <th className="p-3 text-left">{t("rep.daily.revenue")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.products?.length === 0 ? (
                <tr><td colSpan={3} className="p-3 text-center text-gray-400">{t("rep.daily.noOrders")}</td></tr>
              ) : (
                data?.products?.map((p, i) => (
                  <tr key={i} className={`border-t transition hover:bg-gray-300 ${p.name === topProduct ? "font-semibold" : ""}`}>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.qty}</td>
                    <td className="p-3 text-green-600 font-medium">₹{p.revenue}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}