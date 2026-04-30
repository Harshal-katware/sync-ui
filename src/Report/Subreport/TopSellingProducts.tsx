import { useState, type ChangeEvent, type JSX } from "react";
import jsPDF from "jspdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Product {
  name: string;
  qty: number;
  revenue: number;
}

type SortOrder = "high" | "low";

export default function TopSellingProducts(): JSX.Element {
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<SortOrder>("high");

  const products: Product[] = [
    { name: "Pizza", qty: 50, revenue: 10000 },
    { name: "Burger", qty: 40, revenue: 8000 },
    { name: "Pasta", qty: 30, revenue: 6000 },
    { name: "Sandwich", qty: 25, revenue: 5000 },
  ];

  let filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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
      doc.text(`${p.name} - ${p.qty} sold - ₹${p.revenue}`, 20, 40 + i * 10);
    });

    doc.save("top-products.pdf");
  };

  return (
    <div className="space-y-6">

      {/*  Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <h1 className="text-xl sm:text-2xl font-serif">
          Top Products
        </h1>

        <button
          onClick={downloadPDF}
          className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:scale-105 transition"
        >
          Export
        </button>
      </div>

      {/*  Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Total Items</p>
          <h2 className="text-lg font-bold">{totalQty}</h2>
        </div>

        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <h2 className="text-lg font-bold text-green-600">
            ₹{totalRevenue}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-5 rounded-xl">
          <p className="text-sm">Top Product</p>
          <h2 className="text-lg font-bold">{topProduct}</h2>
        </div>

      </div>

      {/*  Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3">

        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="flex-1 border p-2 rounded-lg w-full"
        />

        <select
          value={sort}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSort(e.target.value as SortOrder)
          }
          className="border p-2 rounded-lg w-full sm:w-auto"
        >
          <option value="high">Top Selling</option>
          <option value="low">Low Selling</option>
        </select>

        <button
          onClick={reset}
          className="w-full sm:w-auto px-3 py-2 bg-gray-400 text-white rounded-lg"
        >
          Reset
        </button>
      </div>

      {/*  Empty */}
      {filtered.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          No products found ❌
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/*  Chart */}
          <div className="bg-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
            <p className="mb-3 font-semibold text-sm sm:text-base">
              Sales Chart
            </p>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filtered}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={false} />
                <Bar
                  dataKey="qty"
                  fill="#7c3aed"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/*  Table */}
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
                  <tr
                    key={i}
                    className="border-t hover:bg-gray-300 transition"
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
        </>
      )}
    </div>
  );
}
