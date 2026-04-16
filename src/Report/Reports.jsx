import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";
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
    <div className=" bg-gray-100 ">
         
     <Navbar variant="module" moduleName="Reports" />

      {/* 🔥 Main Content */}
      <div className="p-5">

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
       <div className="fixed bottom-0 left-0 p-3 sm:p-4">
          <BackButton to="/Dashboard" />
       </div>

    </div>
  );
}