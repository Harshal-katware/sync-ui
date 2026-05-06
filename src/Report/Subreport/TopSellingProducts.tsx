import { useState, useEffect, type ChangeEvent, type JSX } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getTopProducts } from "../../Api/reportApi";

interface Product { name: string; qty: number; revenue: number; }
type SortOrder = "high" | "low";

export default function TopSellingProducts(): JSX.Element {
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<SortOrder>("high");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalQty, setTotalQty] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [topProduct, setTopProduct] = useState("-");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTopProducts(20)
      .then((res) => {
        setAllProducts(res.products ?? []);
        setTotalQty(res.totalQty ?? 0);
        setTotalRevenue(res.totalRevenue ?? 0);
        setTopProduct(res.topProduct ?? "-");
      })
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  // Filter + sort on frontend
  let filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  filtered = [...filtered].sort((a, b) =>
    sort === "high" ? b.qty - a.qty : a.qty - b.qty
  );

  const reset = () => { setSearch(""); setSort("high"); };

  const downloadPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("Top Selling Products Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  // ✅ Summary Table
  autoTable(doc, {
    startY: 40,
    head: [["Summary", "Value"]],
    body: [
      ["Total Items Sold", `${totalQty}`],
      ["Total Revenue", `Rs. ${totalRevenue}`],
      ["Top Product", `${topProduct}`],
    ],
  });

  // ✅ Fix TypeScript issue
  const finalY = (doc as any).lastAutoTable?.finalY || 60;

  // ✅ Products Table
  autoTable(doc, {
    startY: finalY + 10,
    head: [["Product", "Quantity", "Revenue"]],
    body:
      filtered.length > 0
        ? filtered.map((p) => [
            p.name,
            p.qty,
            `Rs. ${p.revenue}`,
          ])
        : [["No Data", "-", "-"]],
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    `Report generated automatically`,
    14,
    285
  );

  doc.save("top-products-report.pdf");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <h1 className="text-xl sm:text-2xl font-serif">Top Products</h1>
        <button onClick={downloadPDF} className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:scale-105 transition">
          Export
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Total Items Sold</p>
          <h2 className="text-lg font-bold">{totalQty}</h2>
        </div>
        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <h2 className="text-lg font-bold text-green-600">₹{totalRevenue}</h2>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-5 rounded-xl">
          <p className="text-sm">Top Product</p>
          <h2 className="text-lg font-bold">{topProduct}</h2>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="flex-1 border p-2 rounded-lg w-full"
        />
        <select
          value={sort}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as SortOrder)}
          className="border p-2 rounded-lg w-full sm:w-auto"
        >
          <option value="high">Top Selling</option>
          <option value="low">Low Selling</option>
        </select>
        <button onClick={reset} className="w-full sm:w-auto px-3 py-2 bg-gray-400 text-white rounded-lg">Reset</button>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          {allProducts.length === 0 ? "No orders yet ❌" : "No products found ❌"}
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* Chart */}
          <div className="bg-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
            <p className="mb-3 font-semibold text-sm sm:text-base">Sales Chart</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filtered}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={false} />
                <Bar dataKey="qty" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-gray-200 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-100">
              <thead className="bg-gray-300">
                <tr>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Qty</th>
                  <th className="p-3 text-left">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={i} className="border-t hover:bg-gray-300 transition">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.qty}</td>
                    <td className="p-3 text-green-600 font-medium">₹{p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}