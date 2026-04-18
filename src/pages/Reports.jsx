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
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">

      {/*  Navbar (Fixed) */}
      <Navbar variant="module" moduleName="Reports" />

      {/*  Main Container */}
      <div className="flex-1 flex justify-center items-center p-4">

        <div className="w-full max-w-6xl h-full relative">

          {/*  Scrollable Content */}
          <div className="h-full overflow-y-auto p-6 pb-24">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h1 className="text-xl sm:text-2xl font-bold">📊 REPORT</h1>

            </div>

            {/* Sections */}
            {sections.map((section, index) => (
              <div key={index} className="mb-8">

                <h2 className="text-lg font-semibold mb-3 underline">
                  {section.title}
                </h2>

                {/* Cards */}
                <div className="
                  grid 
                  grid-cols-1 
                  sm:grid-cols-2 
                  lg:grid-cols-3 
                  gap-4
                ">
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

          {/* 🔙 Back Button (Inside Container FIXED) */}
          <div className="absolute bottom-4 left-4">
            <button
              onClick={() => navigate("/Dashboard")}
              className="px-4 py-2 bg-black text-white rounded-xl shadow-lg"
            >
              ⬅ Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}