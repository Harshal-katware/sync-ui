import { useState, type ChangeEvent } from "react";
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,} from "recharts";

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
    {
      name: "Burger",
      qty: 30,
      revenue: 6000,
      payment: "Cash",
      type: "takeaway",
    },
    { name: "Pasta", qty: 20, revenue: 4000, payment: "Card", type: "online" },
    {
      name: "Sandwich",
      qty: 25,
      revenue: 5000,
      payment: "UPI",
      type: "dine-in",
    },
  ];

  const filtered = data.filter(
    (item) =>
      (payment === "all" || item.payment === payment) &&
      (orderType === "all" || item.type === orderType),
  );

  const totalSales = filtered.reduce((acc, i) => acc + i.revenue, 0);
  const totalQty = filtered.reduce((acc, i) => acc + i.qty, 0);
  const topProduct =
    [...filtered].sort((a, b) => b.qty - a.qty)[0]?.name || "-";

  const resetFilters = () => {
    setPayment("all");
    setOrderType("all");
    setShow(false);
  };

  return (
    <div className="space-y-6">

      {/*  Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Custom Report
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Filter and generate your own report
        </p>
      </div>

      {/*  Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm space-y-4">

        {/* inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <select
            value={payment}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setPayment(e.target.value as PaymentType)
            }
            className="bg-gray-100 border p-3 rounded-lg w-full"
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
            className="bg-gray-100 border p-3 rounded-lg w-full"
          >
            <option value="all">All Orders</option>
            <option value="dine-in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
            <option value="online">Online</option>
          </select>

        </div>

        {/* buttons */}
        <div className="flex flex-col sm:flex-row gap-3">

          <button
            onClick={() => setShow(true)}
            className="w-full sm:w-auto px-6 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500"
          >
            Generate
          </button>

          <button
            onClick={resetFilters}
            className="w-full sm:w-auto px-6 py-2 bg-gray-400 text-white rounded-lg"
          >
            Reset
          </button>

        </div>
      </div>

      {/*  RESULT */}
      {show && (
        <>
          {filtered.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              No data found ❌
            </div>
          )}

          {filtered.length > 0 && (
            <>
              {/*  Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <h2 className="font-bold text-lg">₹{totalSales}</h2>
                </div>

                <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-600">Items Sold</p>
                  <h2 className="font-bold text-lg">{totalQty}</h2>
                </div>

                <div className="bg-linear-to-r from-green-500 to-emerald-500 text-white p-5 rounded-xl shadow">
                  <p className="text-sm">Top Product</p>
                  <h2 className="font-bold text-lg">{topProduct}</h2>
                </div>

              </div>

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
                    <Bar dataKey="revenue" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/*  Table */}
              <div className="bg-gray-200 rounded-xl shadow-sm overflow-x-auto">

                <table className="w-full text-sm min-w-150">

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
                    {filtered.map((item, i) => (
                      <tr
                        key={i}
                        className="border-t hover:bg-gray-300 transition"
                      >
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.qty}</td>
                        <td className="p-3 text-green-600">₹{item.revenue}</td>
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
