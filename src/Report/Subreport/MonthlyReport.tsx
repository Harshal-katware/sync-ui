import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { getMonthlyReport } from "../../Api/reportApi";

interface TopItem { name: string; qty: number; }
interface PaymentData { cash: number; upi: number; card: number; online: number; }

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

interface PieEntry { name: string; value: number; }

const COLORS = ["#7c3aed", "#ec4899", "#22c55e", "#f59e0b"];

export default function MonthlyReport(): React.ReactNode {
  const today = new Date();
  const monthName = today.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMonthlyReport()
      .then(setData)
      .catch(() => setError("Failed to load report."))
      .finally(() => setLoading(false));
  }, []);

  const netSales = data?.netSales ?? 0;

  const pieData: PieEntry[] = data?.payment
    ? Object.entries(data.payment)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({ name: key.toUpperCase(), value }))
    : [];

  // ✅ UPDATED PDF FUNCTION
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Monthly Sales Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Month: ${monthName}`, 14, 30);

    // ✅ Summary Table
    autoTable(doc, {
      startY: 40,
      head: [["Metric", "Value"]],
      body: [
        ["Total Sales", `Rs. ${data?.totalSales ?? 0}`],
        ["Discount", `Rs. ${data?.discount ?? 0}`],
        ["Refund", `Rs. ${data?.refund ?? 0}`],
        ["Net Sales", `Rs. ${netSales}`],
        ["Orders", `${data?.orders ?? 0}`],
        ["Avg Order", `Rs. ${data?.avgOrder ?? 0}`],
      ],
    });

    // ✅ Fix TypeScript error here
    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    // ✅ Top Products Table
    autoTable(doc, {
      startY: finalY + 10,
      head: [["Product", "Quantity Sold"]],
      body:
        data?.topItems?.length
          ? data.topItems.map((item) => [item.name, item.qty])
          : [["No data", "-"]],
    });

    // Footer
    doc.setFontSize(10);
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      14,
      280
    );

    doc.save("monthly-report.pdf");
  };

  // Loading
  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );

  // Error
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
          Monthly Report
        </h1>
        <p className="text-gray-500">{monthName}</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          <p>Total Sales</p>
          <h2 className="font-bold">₹{data?.totalSales ?? 0}</h2>
        </div>

        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          <p>Discount</p>
          <h2 className="text-yellow-600 font-bold">
            ₹{data?.discount ?? 0}
          </h2>
        </div>

        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          <p>Refund</p>
          <h2 className="text-red-500 font-bold">
            ₹{data?.refund ?? 0}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-5 rounded-xl shadow">
          <p>Net Sales</p>
          <h2 className="font-bold">₹{netSales}</h2>
        </div>
      </div>

      {/* Orders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          Orders: <b>{data?.orders ?? 0}</b>
        </div>
        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          Avg Order: <b>₹{data?.avgOrder ?? 0}</b>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-gray-200 p-6 rounded-xl shadow-sm">
          <p className="mb-3 font-semibold">Top Products</p>

          {(data?.topItems?.length ?? 0) === 0 ? (
            <p className="text-center text-gray-400 py-10">
              No data this month
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.topItems ?? []}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={false} />
                <Bar dataKey="qty" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-200 p-6 rounded-xl shadow-sm">
          <p className="mb-3 font-semibold">Payment Methods</p>

          {pieData.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              No payment data
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
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
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
        className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow hover:scale-105 transition"
      >
        📄 Download Report
      </button>
    </div>
  );
}