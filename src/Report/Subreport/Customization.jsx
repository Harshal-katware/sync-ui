import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BackButton from "../../components/BackButton";
import jsPDF from "jspdf";

export default function CustomizeReport() {
  const navigate = useNavigate();

  const [type, setType] = useState("daily");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [reportType, setReportType] = useState("sales");
  const [payment, setPayment] = useState("all");
  const [orderType, setOrderType] = useState("all");
  const [viewType, setViewType] = useState("summary");
  const [sort, setSort] = useState("top");
  const [show, setShow] = useState(false);

  // Dummy Data
  const data = [
    { name: "Pizza", qty: 50, revenue: 10000, payment: "UPI", type: "dine-in" },
    { name: "Burger", qty: 30, revenue: 6000, payment: "Cash", type: "takeaway" },
    { name: "Pasta", qty: 20, revenue: 4000, payment: "Card", type: "online" },
  ];

  // Filter Logic
  let filtered = data.filter((item) => {
    return (
      (payment === "all" || item.payment === payment) &&
      (orderType === "all" || item.type === orderType)
    );
  });

  // Sorting
  filtered.sort((a, b) =>
    sort === "top" ? b.qty - a.qty : a.qty - b.qty
  );

  // Totals
  const totalSales = filtered.reduce((acc, i) => acc + i.revenue, 0);
  const totalQty = filtered.reduce((acc, i) => acc + i.qty, 0);

  // PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Custom Report", 20, 20);

    filtered.forEach((item, i) => {
      doc.text(
        `${item.name} - ${item.qty} sold - ₹${item.revenue}`,
        20,
        40 + i * 10
      );
    });

    doc.save("custom-report.pdf");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">

      {/* Navbar (Fixed) */}
      <Navbar variant="module" moduleName="Reports" />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">

          <h1 className="text-2xl font-bold mb-6">
            Customize Report
          </h1>

          {/* Filters */}
          <div className="bg-white p-6 rounded shadow mb-6 grid grid-cols-2 gap-4">

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>

            {type === "daily" ? (
              <input
                type="date"
                onChange={(e) => setDate(e.target.value)}
                className="border p-2 rounded"
              />
            ) : (
              <input
                type="month"
                onChange={(e) => setMonth(e.target.value)}
                className="border p-2 rounded"
              />
            )}

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="sales">Sales</option>
              <option value="orders">Orders</option>
              <option value="products">Products</option>
            </select>

            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All Payments</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>

            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All Orders</option>
              <option value="dine-in">Dine-in</option>
              <option value="takeaway">Takeaway</option>
              <option value="online">Online</option>
            </select>

            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="top">Top Selling</option>
              <option value="low">Low Selling</option>
            </select>

          </div>

          {/* Generate Button */}
          <button
            onClick={() => setShow(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded mb-6"
          >
            Generate Report
          </button>

          {/* Output */}
          {show && (
            <div className="bg-white p-6 rounded shadow">

              {viewType === "summary" && (
                <div className="mb-4">
                  <p>Total Sales: ₹{totalSales}</p>
                  <p>Total Items Sold: {totalQty}</p>
                </div>
              )}

              <table className="w-full mb-4">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Item</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Revenue</th>
                    <th className="p-2">Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.qty}</td>
                      <td className="p-2">₹{item.revenue}</td>
                      <td className="p-2">{item.payment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                📄 Download PDF
              </button>

            </div>
          )}

        </div>
      </div>

      {/* Fixed Back Button */}
      <div className="fixed bottom-0 left-0 p-3 sm:p-4">
        <BackButton to="/reports" />
      </div>

    </div>
  );
}