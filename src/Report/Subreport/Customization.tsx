import { useState, type ChangeEvent } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ✅ Types
type PaymentType = "all" | "Cash" | "UPI" | "Card";
type OrderType = "all" | "dine-in" | "takeaway" | "online";

interface DataItem {
  name: string;
  qty: number;
  revenue: number;
  payment: Exclude<PaymentType, "all">;
  type: Exclude<OrderType, "all">;
}

export default function Customization() {
  const [payment, setPayment] = useState<PaymentType>("all");
  const [orderType, setOrderType] = useState<OrderType>("all");
  const [show, setShow] = useState<boolean>(false);

  const data: DataItem[] = [
    { name: "Pizza", qty: 50, revenue: 10000, payment: "UPI", type: "dine-in" },
    { name: "Burger", qty: 30, revenue: 6000, payment: "Cash", type: "takeaway" },
    { name: "Pasta", qty: 20, revenue: 4000, payment: "Card", type: "online" },
    { name: "Sandwich", qty: 25, revenue: 5000, payment: "UPI", type: "dine-in" },
  ];

  const filtered: DataItem[] = data.filter(
    (item) =>
      (payment === "all" || item.payment === payment) &&
      (orderType === "all" || item.type === orderType)
  );

  const totalSales: number = filtered.reduce(
    (acc, i) => acc + i.revenue,
    0
  );

  const totalQty: number = filtered.reduce(
    (acc, i) => acc + i.qty,
    0
  );

  const topProduct: string =
    [...filtered].sort((a, b) => b.qty - a.qty)[0]?.name || "-";

  const resetFilters = (): void => {
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
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setPayment(e.target.value as PaymentType)
            }
            className="bg-gray-100 border p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All Payments</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>

          <select
            value={orderType}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setOrderType(e.target.value as OrderType)
            }
            className="bg-gray-100 border p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
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
            className="px-6 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500"
          >
            Generate
          </button>

          <button
            onClick={resetFilters}
            className="px-6 py-2 bg-gray-400 hover:bg-gray-500 rounded-lg"
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
                <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
                  <p>Total Sales</p>
                  <h2 className="font-bold">₹{totalSales}</h2>
                </div>

                <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
                  <p>Items Sold</p>
                  <h2 className="font-bold">{totalQty}</h2>
                </div>

                <div className="bg-linear-to-r from-green-500 to-emerald-500 text-white p-5 rounded-xl shadow">
                  <p>Top Product</p>
                  <h2 className="font-bold">{topProduct}</h2>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-gray-200 p-6 rounded-xl shadow-sm">
                <p className="mb-3 font-semibold">Sales Chart</p>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={filtered}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={false} />
                    <Bar dataKey="revenue" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="bg-gray-200 p-6 rounded-xl shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-300">
                    <tr>
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-left">Qty</th>
                      <th className="p-3 text-left">Revenue</th>
                      <th className="p-3 text-left">Payment</th>
                      <th className="p-3 text-left">Type</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((item: DataItem, i: number) => (
                      <tr
                        key={i}
                        className={`border-t ${
                          item.name === topProduct
                            ? "bg-gray-200 font-semibold"
                            : "hover:bg-gray-200"
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