import { useNavigate } from "react-router-dom";

export default function ReportsDashboard() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Daily Update",
      items: [
        { name: "Today's Report", path: "daily-report" },
        { name: "Top Selling Products", path: "top-selling-products" }
      ],
    },
    {
      title: "Monthly Update",
      items: [
        { name: "Customization", path: "customization" },
        { name: "Monthly Report", path: "monthly-report" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">

      {/* 🔥 Main Content */}
      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">📊 REPORT</h1>
        </div>

        {/* Sections */}
        {sections.map((section, index) => (
          <div key={index} className="mb-8">

            <h2 className="text-lg font-semibold mb-3 underline">
              {section.title}
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {section.items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/reports/${item.path}`)}
                  className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg transition"
                >
                  <p className="font-semibold">{item.name}</p>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* 🔙 Back Button (Bottom Left) */}
      <div className="p-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
           Back
        </button>
      </div>

    </div>
  );
}