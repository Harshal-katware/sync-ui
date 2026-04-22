import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  CalendarDays,
} from "lucide-react";
import BackButton from "../components/BackButton.js";

export default function Reports() {
  const location = useLocation();

  const menu = [
    { name: "Today's Report", path: "daily-report", icon: LayoutDashboard },
    { name: "Top Products", path: "top-selling-products", icon: TrendingUp },
    { name: "Customization", path: "customization", icon: Settings },
    { name: "Monthly Report", path: "monthly-report", icon: CalendarDays },
  ];

  return (
    <div className="h-screen flex bg-white/40 p-5">
      {/* Sidebar */}
      <aside className="w-64 bg-[#059669] backdrop-blur-xl text-white rounded-2xl p-6 flex flex-col">
        <h1 className="text-2xl font-serif mb-10 tracking-wide">Reports</h1>

        <nav className="space-y-3">
          {menu.map((item, i) => {
            const Icon = item.icon;
            const active = location.pathname.includes(item.path);
            return (
              <Link
                key={i}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all
                  ${active ? "bg-white/20 text-white font-semibold" : "text-white hover:bg-white/20"}`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className=" fixed bottom-0 left-0 p-3 sm:p-4 ">
          <BackButton to="/dashboard" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-white backdrop-blur-xl rounded-2xl ml-5 flex flex-col overflow-hidden">
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
