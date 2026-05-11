import { useNavigate } from "react-router-dom";

export default function SubscriptionExpired() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const userName =
    localStorage.getItem("userName") ||
    sessionStorage.getItem("userName") ||
    "Admin";

  const subscriptionEnd =
    localStorage.getItem("subscriptionEnd") ||
    sessionStorage.getItem("subscriptionEnd");

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    }) : "—";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="w-full max-w-md text-center" style={{ animation: "fadeUp .4s ease" }}>

        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🔒</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}>
          Subscription Expired
        </h1>

        <p className="text-gray-500 text-sm mb-1">
          Hey <span className="font-semibold text-gray-700">{userName}</span>!
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Your subscription expired on{" "}
          <span className="font-semibold text-red-500">{fmt(subscriptionEnd)}</span>.
          Please contact us to renew your plan.
        </p>

        {/* Plans */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Available Plans
          </p>
          <div className="flex flex-col gap-3">
            {[
              { plan: "Basic",    duration: "3 months",  price: "₹999",  color: "bg-amber-50 border-amber-200 text-amber-700"    },
              { plan: "Standard", duration: "6 months",  price: "₹1,799", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
              { plan: "Premium",  duration: "12 months", price: "₹2,999", color: "bg-purple-50 border-purple-200 text-purple-700"  },
            ].map((p) => (
              <div key={p.plan} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${p.color}`}>
                <div>
                  <p className="font-bold text-sm">{p.plan}</p>
                  <p className="text-[11px] opacity-70">{p.duration}</p>
                </div>
                <p className="font-black text-lg">{p.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Contact Us to Renew
          </p>
          <div className="flex flex-col gap-2">
            <a href="tel:+919876543210"
               className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-700 transition font-medium">
              📞 <span>+91 98765 43210</span>
            </a>
            <a href="mailto:support@syncrestaurant.com"
               className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-700 transition font-medium">
              📧 <span>support@syncrestaurant.com</span>
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer"
               className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-700 transition font-medium">
              💬 <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition">
          Sign Out
        </button>
      </div>
    </div>
  );
}