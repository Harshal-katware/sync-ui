import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function ReportsDashboard() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Daily Update",
      items: [
        { name: "Shift Summary", desc: "Daily transactions & shift insights" },
        { name: "Bill Sales", desc: "Revenue & sales trends" },
        { name: "Product Sales", desc: "Product performance analysis" },
      ],
    },
    {
      title: "Shift Details",
      items: [
        { name: "Shift Sales Summary", desc: "Shift-wise performance" },
        { name: "Invoice Detail", desc: "Transaction insights" },
      ],
    },
    {
      title: "Table Details",
      items: [
        { name: "Premise Report", desc: "Operations analysis" },
        { name: "KOT Report", desc: "Kitchen order tracking" },
        { name: "Table Report", desc: "Table performance" },
      ],
    },
    {
      title: "Product Details",
      items: [
        { name: "Stock Summary", desc: "Inventory & stock analysis" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6 ">

        {/* Header */}
        <div className=" flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">📊 REPORT</h1>
          <button className="px-4 py-2 bg-gray-800 text-white rounded">
            Update Email
          </button>
        </div>

        {/* Sections */}
        {sections.map((section, index) => (
          <div key={index} className="mb-8">

            {/* Section Title */}
            <h2 className="text-lg font-semibold mb-3 underline">
              {section.title}
            </h2>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-4">
              {section.items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/report/${item.name}`)}
                  className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg transition"
                >
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}