import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function MonthlyReport() {
  const navigate = useNavigate();

  const today = new Date();

  //  Current Month Name
  const monthName = today.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  //  Dummy Data
  const data = {
    totalSales: 120000,
    discount: 10000,
    refund: 5000,
    orders: 600,
    avgOrder: 200,
    payment: {
      cash: 30000,
      upi: 70000,
      card: 20000,
    },
    topItems: [
      { name: "Pizza", qty: 200 },
      { name: "Burger", qty: 150 },
      { name: "Pasta", qty: 100 },
    ],
  };

  const netSales = data.totalSales - data.discount - data.refund;

  // PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Monthly Report", 20, 20);
    doc.text(`Month: ${monthName}`, 20, 30);

    doc.text(`Total Sales: ₹${data.totalSales}`, 20, 40);
    doc.text(`Net Sales: ₹${netSales}`, 20, 50);

    doc.text("Top Items:", 20, 70);
    data.topItems.forEach((item, i) => {
      doc.text(
        `${item.name} - ${item.qty} sold`,
        20,
        80 + i * 10
      );
    });

    doc.save("monthly-report.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-6xl mx-auto">

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">
          Monthly Report
        </h1>
        <p className="text-gray-500 mb-6">{monthName}</p>

        {/*  Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">

          <div className="bg-white p-4 rounded shadow">
            <p>Total Sales</p>
            <p className="text-xl font-bold">₹{data.totalSales}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Discount</p>
            <p className="text-xl font-bold text-yellow-600">
              ₹{data.discount}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Refund</p>
            <p className="text-xl font-bold text-red-500">
              ₹{data.refund}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Net Sales</p>
            <p className="text-xl font-bold text-green-600">
              ₹{netSales}
            </p>
          </div>

        </div>

        {/* Orders */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          <div className="bg-white p-4 rounded shadow">
            <p>Total Orders</p>
            <p className="text-xl font-bold">{data.orders}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Avg Order Value</p>
            <p className="text-xl font-bold">₹{data.avgOrder}</p>
          </div>

        </div>

        {/* Payment */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="font-semibold mb-3">
            Payment Breakdown
          </h2>
          <p>Cash: ₹{data.payment.cash}</p>
          <p>UPI: ₹{data.payment.upi}</p>
          <p>Card: ₹{data.payment.card}</p>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="font-semibold mb-3">
            Top Selling Products
          </h2>
          {data.topItems.map((item, i) => (
            <p key={i}>
              {item.name} - {item.qty} sold
            </p>
          ))}
        </div>

        {/* PDF */}
        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          📄 Download Monthly Report
        </button>

      </div>
      <div className="fixed bottom-6 left-6">
         <button
           onClick={() => navigate("/reports")}
           className="px-4 py-2 bg-black text-white rounded-xl border border-white/30 shadow-lg"
          >
           Back
         </button>
        </div>
    </div>
  );
}