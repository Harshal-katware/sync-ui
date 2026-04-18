import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Customization() {
  const [payment, setPayment] = useState("all");
  const [orderType, setOrderType] = useState("all");
  const [show, setShow] = useState(false);

  const data = [
    { name: "Pizza", qty: 50, revenue: 10000, payment: "UPI", type: "dine-in" },
    { name: "Burger", qty: 30, revenue: 6000, payment: "Cash", type: "takeaway" },
    { name: "Pasta", qty: 20, revenue: 4000, payment: "Card", type: "online" },
    { name: "Sandwich", qty: 25, revenue: 5000, payment: "UPI", type: "dine-in" },
  ];

  const filtered = data.filter(
    (item) =>
      (payment === "all" || item.payment === payment) &&
      (orderType === "all" || item.type === orderType)
  );

  const totalSales = filtered.reduce((acc, i) => acc + i.revenue, 0);
  const totalQty = filtered.reduce((acc, i) => acc + i.qty, 0);

  const topProduct =
    [...filtered].sort((a, b) => b.qty - a.qty)[0]?.name || "-";

  const maxValue = Math.max(...filtered.map((i) => i.revenue), 1); // safe

  const resetFilters = () => {
    setPayment("all");
    setOrderType("all");
    setShow(false);
  };

  return (
    <div className="space-y-6">

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Custom Report
        </h1>
        <p className="text-gray-500">
          Filter and generate your own report
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">

          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All Payments</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>

          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All Orders</option>
            <option value="dine-in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
            <option value="online">Online</option>
          </select>

        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShow(true)}
            className="px-6 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow"
          >
            Generate
          </button>

          <button
            onClick={resetFilters}
            className="px-6 py-2 bg-gray-200 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {/* RESULT */}
      {show && (
        <>
          {filtered.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              No data found ❌
            </div>
          )}

          {filtered.length > 0 && (
            <>
              {/* Cards */}
              <div className="grid grid-cols-3 gap-4">

                <div className="bg-white p-5 rounded-xl shadow-sm">
                  <p>Total Sales</p>
                  <h2 className="font-bold">₹{totalSales}</h2>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm">
                  <p>Items Sold</p>
                  <h2 className="font-bold">{totalQty}</h2>
                </div>

                <div className="bg-linear-to-r from-emerald-500 to-emerald-600 text-white p-5 rounded-xl shadow">
                  <p>Top Product</p>
                  <h2 className="font-bold">{topProduct}</h2>
                </div>

              </div>

              {/* 🔥 Dynamic Color Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="mb-3 font-semibold">Sales Chart</p>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={filtered}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={false} />

                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {filtered.map((entry, index) => {
                        const intensity = entry.revenue / maxValue;

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.revenue === maxValue
                                ? "#6d28d9" // 🔥 top product highlight
                                : `rgba(124,58,237, ${0.3 + intensity})`
                            }
                          />
                        );
                      })}
                    </Bar>

                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="bg-white p-6 rounded-xl shadow-sm">

                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-left">Qty</th>
                      <th className="p-3 text-left">Revenue</th>
                      <th className="p-3 text-left">Payment</th>
                      <th className="p-3 text-left">Type</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((item, i) => (
                      <tr
                        key={i}
                        className={`border-t ${
                          item.name === topProduct
                            ? "bg-purple-50 font-semibold"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.qty}</td>
                        <td className="p-3 text-green-600">
                          ₹{item.revenue}
                        </td>
                        <td className="p-3">{item.payment}</td>
                        <td className="p-3 capitalize">{item.type}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}