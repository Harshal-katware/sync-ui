import { useState } from "react";
import jsPDF from "jspdf";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function TopSellingProducts() {

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("high");

  const products = [
    { name: "Pizza", qty: 50, revenue: 10000 },
    { name: "Burger", qty: 40, revenue: 8000 },
    { name: "Pasta", qty: 30, revenue: 6000 },
    { name: "Sandwich", qty: 25, revenue: 5000 },
  ];

  // 🔥 Filter
  let filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🔥 Sort
  filtered = [...filtered].sort((a, b) =>
    sort === "high" ? b.qty - a.qty : a.qty - b.qty
  );

  const totalQty = filtered.reduce((a, b) => a + b.qty, 0);
  const totalRevenue = filtered.reduce((a, b) => a + b.revenue, 0);
  const topProduct = filtered[0]?.name || "-";

  const reset = () => {
    setSearch("");
    setSort("high");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Top Products Report", 20, 20);

    filtered.forEach((p, i) => {
      doc.text(
        `${p.name} - ${p.qty} sold - ₹${p.revenue}`,
        20,
        40 + i * 10
      );
    });

    doc.save("top-products.pdf");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Top Products</h1>

        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow"
        >
          Export
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <p>Total Items</p>
          <h2 className="font-bold">{totalQty}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <p>Total Revenue</p>
          <h2 className="font-bold text-green-600">₹{totalRevenue}</h2>
        </div>

        <div className="bg-linear-to-r from-purple-500 to-pink-500 text-white p-5 rounded-xl">
          <p>Top Product</p>
          <h2 className="font-bold">{topProduct}</h2>
        </div>

      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3">

        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border p-2 rounded-lg"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="high">Top Selling</option>
          <option value="low">Low Selling</option>
        </select>

        <button
          onClick={reset}
          className="px-3 bg-gray-200 rounded-lg"
        >
          Reset
        </button>

      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          No products found ❌
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* 🔥 Real Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="mb-3 font-semibold">Sales Chart</p>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filtered}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qty" fill="#7c3aed" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm">

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Qty</th>
                  <th className="p-3 text-left">Revenue</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p, i) => (
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
                    <td className="p-3 text-green-600">
                      ₹{p.revenue}
                    </td>
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