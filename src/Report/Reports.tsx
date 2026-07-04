import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Settings, CalendarDays, Menu } from "lucide-react";
import { useState } from "react";
import { useLang } from "../context/languageContext";

export default function Reports() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  const menu = [
    { nameKey: "rep.todayReport",   path: "daily-report",         icon: LayoutDashboard },
    { nameKey: "rep.topProducts",   path: "top-selling-products", icon: TrendingUp      },
    { nameKey: "rep.customization", path: "customization",        icon: Settings        },
    { nameKey: "rep.monthlyReport", path: "monthly-report",       icon: CalendarDays    },
  ];

  return (
    <div className="h-screen flex bg-white/40 p-5 relative">

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 text-white p-2 rounded-lg"
        style={{ background: "linear-gradient(135deg, #0d4a3a, #1a6b52)" }}
      >
        <Menu size={20} />
      </button>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full z-40
          w-64 backdrop-blur-xl text-white rounded-2xl p-6 flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{ background: "linear-gradient(160deg, #0d4a3a 0%, #1a6b52 100%)" }}
      >
        <h1 className="text-2xl font-serif mb-10 tracking-wide">
          {t("rep.title")}
        </h1>

        <nav className="space-y-3">
          {menu.map((item, i) => {
            const Icon = item.icon;
            const active = location.pathname.includes(item.path);
            return (
              <Link
                key={i}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all
                  ${active ? "bg-white/20 text-white font-semibold" : "text-white hover:bg-white/20"}`}
              >
                <Icon size={18} />
                {t(item.nameKey)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 text-white rounded-lg hover:bg-white/20 transition"
          >
            {t("rep.back")}
          </button>
        </div>
      </aside>

      {/* OVERLAY (mobile only) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* MAIN */}
      <main className="flex-1 bg-white backdrop-blur-xl rounded-2xl ml-0 md:ml-5 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}