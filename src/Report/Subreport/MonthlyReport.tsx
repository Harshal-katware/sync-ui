import jsPDF from "jspdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface TopItem {
  name: string;
  qty: number;
}

interface PaymentData {
  cash: number;
  upi: number;
  card: number;
}

interface ReportData {
  totalSales: number;
  discount: number;
  refund: number;
  orders: number;
  avgOrder: number;
  payment: PaymentData;
  topItems: TopItem[];
}

interface PieEntry {
  name: string;
  value: number;
}

export default function MonthlyReport(): React.ReactNode {
  const today: Date = new Date();

  const monthName: string = today.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const data: ReportData = {
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

  const netSales: number = data.totalSales - data.discount - data.refund;

  const barData: TopItem[] = data.topItems;

  const pieData: PieEntry[] = Object.entries(data.payment).map(
    ([key, value]: [string, number]) => ({
      name: key,
      value: value,
    }),
  );

  const COLORS: string[] = ["#7c3aed", "#ec4899", "#22c55e"];

  const downloadPDF = (): void => {
    const doc = new jsPDF();

    doc.text("Monthly Report", 20, 20);
    doc.text(`Month: ${monthName}`, 20, 30);
    doc.text(`Total Sales: ₹${data.totalSales}`, 20, 40);

    doc.save("monthly-report.pdf");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-serif text-gray-800">Monthly Report</h1>
        <p className="text-gray-500">{monthName}</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          <p>Total Sales</p>
          <h2 className="font-bold">₹{data.totalSales}</h2>
        </div>

        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          <p>Discount</p>
          <h2 className="text-yellow-600 font-bold">₹{data.discount}</h2>
        </div>

        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          <p>Refund</p>
          <h2 className="text-red-500 font-bold">₹{data.refund}</h2>
        </div>

        <div className="bg-linear-to-r from-green-500 to-emerald-500 text-white p-5 rounded-xl shadow">
          <p>Net Sales</p>
          <h2 className="font-bold">₹{netSales}</h2>
        </div>
      </div>

      {/* Orders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          Orders: <b>{data.orders}</b>
        </div>
        <div className="bg-gray-200 p-5 rounded-xl shadow-sm">
          Avg Order: <b>₹{data.avgOrder}</b>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-gray-200 p-6 rounded-xl shadow-sm">
          <p className="mb-3 font-semibold">Top Products</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={false} />
              <Bar dataKey="qty" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-200 p-6 rounded-xl shadow-sm">
          <p className="mb-3 font-semibold">Payment Methods</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {pieData.map((entry: PieEntry, index: number) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length] ?? "#cccccc"}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products List */}
      <div className="bg-gray-200 p-6 rounded-xl shadow-sm">
        <h2 className="font-semibold mb-4">Top Selling Products</h2>
        {data.topItems.map((item: TopItem, i: number) => (
          <div key={i} className="flex justify-between border-b py-2">
            <span>{item.name}</span>
            <span className="font-semibold">{item.qty} sold</span>
          </div>
        ))}
      </div>

      {/* Download */}
      <button
        onClick={downloadPDF}
        className="px-6 py-2 bg-linear-to-r from-red-500 to-red-500 text-white rounded-lg shadow hover:scale-105 transition"
      >
        📄 Download Report
      </button>
    </div>
  );
}
