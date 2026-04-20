import { useNavigate } from "react-router-dom";

/**
 * Navbar — Reusable navigation bar component
 *
 * Two variants driven by the `variant` prop:
 *
 * 1. "dashboard"  →  Dark/blurred bar with app name, settings & profile icons visible
 * 2. "module"     →  Solid emerald-700 bar with module name, NO settings/profile icons
 *
 * Props:
 *  - variant         : "dashboard" | "module"   (default: "dashboard")
 *  - appName         : string  — brand name shown in dashboard mode   (default: "Sync Restaurant")
 *  - moduleName      : string  — module label shown in module mode    (default: "")
 *  - moduleSubtitle  : string  — small subtitle under module name     (default: "Restaurant Management System")
 *  - onSettingsClick : () => void — settings icon click handler
 *  - onProfileClick  : () => void — profile icon click handler
 *
 * Usage:
 *
 *  // Dashboard
 *  <Navbar variant="dashboard" appName="Sync Restaurant" />
 *
 *  // Inventory module
 *  <Navbar variant="module" moduleName="Inventory Control" />
 *
 *  // Billing module
 *  <Navbar variant="module" moduleName="Billing" />
 */

export default function Navbar({
  variant = "dashboard",
  appName = "Sync Restaurant",
  moduleName = "",
  moduleSubtitle = "Restaurant Management System",
  onSettingsClick,
  onProfileClick,
}) {
  const isDashboard = variant === "dashboard";

  return isDashboard ? (
    <DashboardNav
      appName={appName}
      onSettingsClick={onSettingsClick}
      onProfileClick={onProfileClick}
    />
  ) : (
    <ModuleNav moduleName={moduleName} moduleSubtitle={moduleSubtitle} />
  );
}

// ── Dashboard Variant ──────────────────────────────────────────────────────────
function DashboardNav({ appName, onSettingsClick, onProfileClick }) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-black/5 backdrop-blur-md border-b border-white/10">
      <div className="w-full px-4 sm:px-8 h-14 flex items-center justify-between gap-3">

        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🍽️</span>
          <span className="text-white font-bold text-base sm:text-lg tracking-wide">
            {appName}
          </span>
        </div>

        {/* Right — Settings & Profile */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSettingsClick}
            aria-label="Settings"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-all active:scale-95"
          >
            <SettingsIcon />
          </button>
          <button
            onClick={onProfileClick}
            aria-label="Profile"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-all active:scale-95"
          >
            <ProfileIcon />
          </button>
        </div>

      </div>
    </nav>
  );
}

// ── Module Variant ─────────────────────────────────────────────────────────────
function ModuleNav({ moduleName, moduleSubtitle }) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-emerald-700 shadow-md">
      <div className="w-full px-4 sm:px-8 py-4 flex items-center gap-3">

        {/* Text block — matches the pattern from Menu Manager */}
        <div>
          <h1 className="text-xl sm:text-[26px] font-serif text-white tracking-wide">
            {moduleName}
          </h1>
          <p className="text-[10px] sm:text-[11px] text-white/70 tracking-[2px] uppercase mt-1 font-semibold">
            {moduleSubtitle}
          </p>
        </div>

      </div>
    </nav>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}