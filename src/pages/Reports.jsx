import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import jsPDF from "jspdf";

export default function Reports() {
  const navigate = useNavigate();

  const [type, setType] = useState("daily");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [sort, setSort] = useState("orders");

  const reportData = {
    dailyTotal: 5000,
    monthlyTotal: 120000,
    orders: 120,
    items: [
      { name: "Butter Chicken", orders: 187, revenue: 42075, status: "Trending" },
      { name: "Paneer Tikka", orders: 154, revenue: 30800, status: "Trending" },
      { name: "Dal Makhani", orders: 142, revenue: 24850, status: "Steady" },
      { name: "Naan Basket", orders: 138, revenue: 13800, status: "Steady" },
      { name: "Gulab Jamun", orders: 97, revenue: 11640, status: "Slow" },
    ],
  };

  //  Status Color
  const getStatusColor = (status) => {
    if (status === "Trending") return "bg-green-100 text-green-600";
    if (status === "Steady") return "bg-yellow-100 text-yellow-600";
    return "bg-red-100 text-red-600";
  };

  //  Sorting
  const sortedItems = [...reportData.items].sort((a, b) =>
    sort === "orders"
      ? b.orders - a.orders
      : b.revenue - a.revenue
  );

  //  PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Restaurant Report", 20, 20);

    doc.text(
      `Type: ${type === "daily" ? "Daily" : "Monthly"}`,
      20,
      30
    );

    doc.text(
      type === "daily" ? `Date: ${date}` : `Month: ${month}`,
      20,
      40
    );

    doc.text(
      `Total: ₹${
        type === "daily"
          ? reportData.dailyTotal
          : reportData.monthlyTotal
      }`,
      20,
      50
    );

    doc.text(`Orders: ${reportData.orders}`, 20, 60);

    doc.text("Top Items:", 20, 80);

    sortedItems.forEach((item, i) => {
      doc.text(
        `${item.name} - ${item.orders} orders - ₹${item.revenue} - ${item.status}`,
        20,
        90 + i * 10
      );
    });

    doc.save("report.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-8 max-w-6xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-gray-800 text-white rounded"
        >
          ⬅ Back
        </button>

        <h1 className="text-2xl font-bold mb-6">
          📊 Reports Dashboard
        </h1>

        {/* Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setType("daily")}
            className={`px-4 py-2 rounded ${
              type === "daily" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Daily
          </button>

          <button
            onClick={() => setType("monthly")}
            className={`px-4 py-2 rounded ${
              type === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white p-6 rounded shadow mb-6">
          {type === "daily" ? (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
          ) : (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
          )}

          <button
            onClick={() => setShowReport(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            View Report
          </button>
        </div>

        {/* Report View */}
        {showReport && (
          <div className="bg-white p-6 rounded shadow">

            <h2 className="font-semibold mb-4">
              {type === "daily"
                ? `Report for ${date}`
                : `Report for ${month}`}
            </h2>

            {/* Totals */}
            <p className="mb-2">
              💰 Total: ₹
              {type === "daily"
                ? reportData.dailyTotal
                : reportData.monthlyTotal}
            </p>

            <p className="mb-4">
              🧾 Orders: {reportData.orders}
            </p>

            {/* Sorting */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setSort("orders")}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Sort by Orders
              </button>

              <button
                onClick={() => setSort("revenue")}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Sort by Revenue
              </button>
            </div>

            {/* Table */}
            <table className="w-full mb-6 bg-gray-50 rounded-lg overflow-hidden">
              <thead className="bg-gray-200">
                <tr className="text-left">
                  <th className="p-2">Item</th>
                  <th className="p-2">Orders</th>
                  <th className="p-2">Revenue</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {sortedItems.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.orders}</td>
                    <td className="p-2">₹{item.revenue}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Download */}
            <button
              onClick={downloadPDF}
              className="px-6 py-2 bg-green-500 text-white rounded"
            >
              📄 Download PDF
            </button>

          </div>
        )}

      </div>
    </div>
  );
}