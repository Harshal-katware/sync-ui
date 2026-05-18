import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SubscriptionWarning() {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  const subscriptionEnd =
    localStorage.getItem("subscriptionEnd") ||
    sessionStorage.getItem("subscriptionEnd");

  const subscriptionStatus =
    localStorage.getItem("subscriptionStatus") ||
    sessionStorage.getItem("subscriptionStatus");

    const userRole =
    localStorage.getItem("userRole") ||
    sessionStorage.getItem("userRole");  

  if (!subscriptionEnd || dismissed) return null;
  if (subscriptionStatus === "EXPIRED") return null;
  if (userRole === "SUPER_ADMIN") return null;
  
  const daysLeft = Math.ceil(
    (new Date(subscriptionEnd).getTime() - Date.now()) / 86400000
  );

  if (daysLeft > 5) return null;

  const isUrgent = daysLeft <= 2;

  return (
    <div className={`w-full px-4 py-3 flex items-center justify-between gap-3 ${
      isUrgent ? "bg-red-500" : "bg-amber-500"
    }`}>
      <div className="flex items-center gap-2 text-white">
        <span className="text-lg">{isUrgent ? "🚨" : "⚠️"}</span>
        <p className="text-sm font-semibold">
          {daysLeft <= 0
            ? "Your subscription has expired!"
            : `Your subscription expires in ${daysLeft} day${daysLeft > 1 ? "s" : ""}! Please renew to continue.`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="text-white/70 hover:text-white text-xl leading-none transition"
        >
          ×
        </button>
      </div>
    </div>
  );
}