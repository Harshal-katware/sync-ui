import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function ShiftSummary() {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString();

  const data = {
    totalSales: 25000,
    discount: 2000,
    refund: 1000,
    totalOrders: 120,
    avgOrder: 210,
  };

  const netSales = data.totalSales - data.discount - data.refund;

  // PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Today Report", 20, 20);
    doc.text(`Date: ${today}`, 20, 30);

    doc.text(`Total Sales: ₹${data.totalSales}`, 20, 40);
    doc.text(`Discount: ₹${data.discount}`, 20, 50);
    doc.text(`Refund: ₹${data.refund}`, 20, 60);
    doc.text(`Net Sales: ₹${netSales}`, 20, 70);

    doc.text(`Orders: ${data.totalOrders}`, 20, 80);
    doc.text(`Avg Order: ₹${data.avgOrder}`, 20, 90);

    doc.save("today-report.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-5xl mx-auto">

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">
          Today Report
        </h1>
        <p className="text-gray-500 mb-6">{today}</p>

        {/*  Main Stats */}
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

        {/*  Order Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          <div className="bg-white p-4 rounded shadow">
            <p>Total Orders</p>
            <p className="text-xl font-bold">{data.totalOrders}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Avg Order Value</p>
            <p className="text-xl font-bold">₹{data.avgOrder}</p>
          </div>

        </div>

        {/*  Simple Summary Table */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="font-semibold mb-4">
            Summary
          </h2>

          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="p-2">Total Sales</td>
                <td className="p-2">₹{data.totalSales}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Discount</td>
                <td className="p-2">₹{data.discount}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Refund</td>
                <td className="p-2">₹{data.refund}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-semibold">Net Sales</td>
                <td className="p-2 font-semibold text-green-600">
                  ₹{netSales}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PDF */}
        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          📄 Download Report
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