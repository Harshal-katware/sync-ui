import jsPDF from "jspdf";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function DailyUpdate() {

  const today = new Date().toLocaleDateString();

  const data = {
    totalSales: 25000,
    discount: 2000,
    refund: 1000,
    orders: 120,
    avg: 210,
  };

  const products = [
    { name: "Pizza", qty: 50, revenue: 10000 },
    { name: "Burger", qty: 40, revenue: 8000 },
    { name: "Pasta", qty: 30, revenue: 6000 },
  ];

  const net = data.totalSales - data.discount - data.refund;

  const chartData = [
    { time: "10AM", sales: 2000 },
    { time: "12PM", sales: 5000 },
    { time: "2PM", sales: 7000 },
    { time: "6PM", sales: 9000 },
    { time: "9PM", sales: 12000 },
  ];

  const topProduct = [...products].sort((a,b)=>b.qty-a.qty)[0]?.name;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Today Report", 20, 20);
    doc.text(`Date: ${today}`, 20, 30);
    doc.save("today-report.pdf");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-serif">
            Today Report
          </h1>
          <p className="text-gray-800">{today}</p>
        </div>

        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-linear-to-r bg-emerald-700 text-white rounded-lg shadow hover:scale-105 transition"
        >
          Export
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500">Total Sales</p>
          <h2 className="text-xl font-bold">₹{data.totalSales}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500">Discount</p>
          <h2 className="text-xl font-bold text-yellow-600">₹{data.discount}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500">Refund</p>
          <h2 className="text-xl font-bold text-red-500">₹{data.refund}</h2>
        </div>

        <div className="bg-linear-to-r from-emerald-500 to-emerald-600 text-white p-5 rounded-xl shadow">
          <p className="text-sm">Net Sales</p>
          <h2 className="text-xl font-bold">₹{net}</h2>
          <span className="text-xs bg-white/20 px-2 py-1 rounded mt-2 inline-block">
            +12% today
          </span>
        </div>

      </div>

      {/* Orders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          Orders: <b>{data.orders}</b>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm">
          Avg Order: <b>₹{data.avg}</b>
        </div>
      </div>

      {/* 🔥 REAL CHART */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="mb-3 font-semibold">Sales Trend</p>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-xl shadow-sm">

        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold">Top Selling Products</p>
          <span className="text-sm text-gray-500">Today</span>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Revenue</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p, i) => (
              <tr
                key={i}
                className={`border-t ${
                  p.name === topProduct
                    ? "bg-purple-50 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.qty}</td>
                <td className="p-3 text-green-600 font-medium">
                  ₹{p.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
}