import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function TopSellingProducts() {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString();

  const products = [
    { name: "Pizza", qty: 50, revenue: 10000 },
    { name: "Burger", qty: 40, revenue: 8000 },
    { name: "Pasta", qty: 30, revenue: 6000 },
    { name: "Sandwich", qty: 20, revenue: 4000 },
    { name: "Cold Coffee", qty: 15, revenue: 3000 },
  ];

  //  Sorting (top first)
  const sorted = [...products].sort((a, b) => b.qty - a.qty);

  const totalQty = products.reduce((acc, p) => acc + p.qty, 0);
  const totalRevenue = products.reduce((acc, p) => acc + p.revenue, 0);

  // PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Top Selling Products - Today", 20, 20);
    doc.text(`Date: ${today}`, 20, 30);

    sorted.forEach((p, i) => {
      doc.text(
        `${i + 1}. ${p.name} - ${p.qty} sold - ₹${p.revenue}`,
        20,
        50 + i * 10
      );
    });

    doc.text(`Total Items Sold: ${totalQty}`, 20, 120);
    doc.text(`Total Revenue: ₹${totalRevenue}`, 20, 130);

    doc.save("top-products.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-5xl mx-auto">

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">
          Top Selling Products (Today)
        </h1>
        <p className="text-gray-500 mb-6">{today}</p>

        {/*  Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <p>Total Items Sold</p>
            <p className="text-xl font-bold">{totalQty}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Total Revenue</p>
            <p className="text-xl font-bold">₹{totalRevenue}</p>
          </div>
        </div>

        {/*  Top 3 Highlight */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {sorted.slice(0, 3).map((p, i) => (
            <div
              key={i}
              className="bg-yellow-100 p-4 rounded shadow text-center"
            >
              <p className="font-bold">#{i + 1}</p>
              <p>{p.name}</p>
              <p>{p.qty} sold</p>
            </div>
          ))}
        </div>

        {/*  Table */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="font-semibold mb-4">
            Product Performance
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Rank</th>
                <th className="p-2">Product</th>
                <th className="p-2">Qty Sold</th>
                <th className="p-2">Revenue</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2 font-bold">#{i + 1}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.qty}</td>
                  <td className="p-2">₹{p.revenue}</td>
                </tr>
              ))}
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