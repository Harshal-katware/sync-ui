import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import restroImage from "../assets/restro4.jpg";

export default function Dashboard() {
  const navigate = useNavigate();

  const navCards = [
    { title: "Billing", desc: "Manage orders easily", icon: "🧾", path: "/billing" },
    { title: "Menu", desc: "Update food items", icon: "🍽️", path: "/menu" },
    { title: "Inventory", desc: "Track stock", icon: "📦", path: "/inventory" },
    { title: "Reports", desc: "View analytics", icon: "📊", path: "/reports" },
  ];

  return (
    <div className="min-h-screen relative">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${restroImage})` }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/50 to-black/10"></div>

      {/* Content */}
      <div className="relative z-10">

        <Navbar
          variant="dashboard"
          appName="Sync Restaurant"
          onSettingsClick={() => navigate("/settings")}
          onProfileClick={() => navigate("/profile")}
        />

        {/*  Main Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">

          {/* Heading */}
          <div className="mb-6 sm:mb-8 text-white 
            text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome 👋
            </h1>
            <p className="text-sm sm:text-base opacity-80">
              Manage your restaurant efficiently
            </p>
          </div>

          {/* Cards */}
          <div className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            gap-4 sm:gap-6
          ">
            {navCards.map((card) => (
              <div
                key={card.title}
                onClick={() => navigate(card.path)}
                className="bg-white/5 backdrop-blur-lg border border-white/30 
                rounded-2xl p-4 sm:p-6 cursor-pointer 
                hover:scale-[1.03] hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl">
                    {card.icon}
                  </span>
                  <p className="text-xl sm:text-2xl font-semibold text-white">
                    {card.title}
                  </p>
                </div>

                <p className="text-sm sm:text-base text-gray-200 mt-2">
                  {card.desc}
                </p>

                <p className="text-xs sm:text-sm text-gray-300 mt-3">
                  Click to manage →
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}