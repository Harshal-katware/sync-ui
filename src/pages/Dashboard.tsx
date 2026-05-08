import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import type { JSX } from "react";
import restroImage from "../assets/restro4.jpg";
import { useLang } from "../context/languageContext";
import { getRestaurantInfo } from "../Api/restaurantApi"; // ✅
 
interface NavCard {
  title: string;
  desc: string;
  icon: string;
  path: string;
}
 
export default function Dashboard(): JSX.Element {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [restaurantName, setRestaurantName] = useState<string>(""); // ✅
 
  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
 
  // ✅ Restaurant name DB se fetch karo
  useEffect(() => {
    getRestaurantInfo()
      .then((data) => { if (data?.name) setRestaurantName(data.name); })
      .catch(() => {}); // fail hone pe default rahega
  }, []);
 
  // Username from storage
  const userName =
    localStorage.getItem("userName") ||
    sessionStorage.getItem("userName") ||
    "Admin";
 
  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return t("dash.morning");
    if (h < 17) return t("dash.afternoon");
    return t("dash.evening");
  };
 
  const clockLocale = lang === "en" ? "en-IN" : "hi-IN";
 
  const navCards: NavCard[] = [
    { title: t("dash.billing"),   desc: t("dash.billingDesc"),   icon: "🧾", path: "/billing" },
    { title: t("dash.menu"),      desc: t("dash.menuDesc"),      icon: "🍽️", path: "/menu" },
    { title: t("dash.inventory"), desc: t("dash.inventoryDesc"), icon: "📦", path: "/inventory" },
    { title: t("dash.reports"),   desc: t("dash.reportsDesc"),   icon: "📊", path: "/reports" },
  ];
 
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${restroImage})` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10" />
 
      <div className="relative z-10">
        <div className="relative z-50">
          <Navbar variant="dashboard" restaurantName={restaurantName} /> {/* ✅ naam pass karo */}
        </div>
 
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
 
          {/* Heading */}
          <div className="mb-6 sm:mb-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-1">
                {greeting()}, {userName}
              </p>
              {/* ✅ Restaurant name DB se, fallback t() */}
              <h1 className="text-2xl sm:text-3xl font-bold">
                {restaurantName ? `${restaurantName}` : t("dash.title")}
              </h1>
              <p className="text-sm sm:text-base opacity-80">{t("dash.subtitle")}</p>
            </div>
 
            {/* Live clock */}
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 backdrop-blur-sm self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <div>
                <p className="text-white font-semibold text-lg leading-none tabular-nums">
                  {time.toLocaleTimeString(clockLocale, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
                <p className="text-white/50 text-xs mt-0.5">
                  {time.toLocaleDateString(clockLocale, { weekday: "short", day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
          </div>
 
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {navCards.map((card: NavCard) => (
              <div
                key={card.title}
                onClick={() => navigate(card.path)}
                className="bg-white/5 backdrop-blur-lg border border-white/30 rounded-2xl p-4 sm:p-6 cursor-pointer hover:scale-[1.03] hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl">{card.icon}</span>
                  <p className="text-xl sm:text-2xl font-semibold text-white">{card.title}</p>
                </div>
                <p className="text-sm sm:text-base text-gray-200 mt-2">{card.desc}</p>
                <p className="text-xs sm:text-sm text-gray-300 mt-3">{t("dash.clickManage")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
 