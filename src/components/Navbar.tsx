import { useState, useRef, useEffect } from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── TYPES ───────────────────────────────────────────────────────────────
type PasswordForm = {
  current: string;
  newPass: string;
  confirm: string;
};

type ShowState = {
  current: boolean;
  newPass: boolean;
  confirm: boolean;
};

interface ChangePasswordModalProps {
  onClose: () => void;
}

interface LogoutConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

interface NavbarProps {
  variant?: "dashboard" | "module";
  moduleName?: string;
  moduleSubtitle?: string;
}

// ─── Change Password Modal ───────────────────────────────────────────────
function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [form, setForm] = useState<PasswordForm>({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [show, setShow] = useState<ShowState>({
    current: false,
    newPass: false,
    confirm: false,
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = () => {
    setError("");
    if (!form.current || !form.newPass || !form.confirm)
      return setError("All fields are required.");
    if (form.newPass.length < 6)
      return setError("New password must be at least 6 characters.");
    if (form.newPass !== form.confirm)
      return setError("Passwords do not match.");
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1800);
  };

  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {visible ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );

  const fields: { key: keyof PasswordForm; label: string; placeholder: string }[] = [
    { key: "current", label: "Current Password", placeholder: "Enter current password" },
    { key: "newPass", label: "New Password",     placeholder: "Enter new password"     },
    { key: "confirm", label: "Confirm Password", placeholder: "Confirm new password"   },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
         style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
         onClick={(e: React.MouseEvent<HTMLDivElement>) =>
           e.target === e.currentTarget && onClose()
         }>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
           style={{ animation: "cpFadeIn .25s ease" }}>
        <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-serif text-[17px] font-semibold">Change Password</h2>
            <p className="text-emerald-200 text-[11px] mt-0.5">Update your account credentials</p>
          </div>
          <button onClick={onClose}
                  className="text-emerald-200 hover:text-white text-xl leading-none transition-colors">
            ✕
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3.5">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] text-gray-400 uppercase tracking-[1.5px] mb-1.5 font-semibold">
                {label}
              </label>
              <div className="relative">
                <input
                  type={show[key] ? "text" : "password"}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 pr-10 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                />
                <button type="button"
                        onClick={() => setShow({ ...show, [key]: !show[key] })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <EyeIcon visible={show[key]} />
                </button>
              </div>
            </div>
          ))}
          {error && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1.5">⚠ {error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
              ✓ Password changed successfully!
            </p>
          )}
          <button onClick={handleSubmit}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all active:scale-95 mt-1">
            Update Password
          </button>
          <button onClick={onClose}
                  className="w-full py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Logout Confirmation ─────────────────────────────────────────────────
function LogoutConfirm({ onConfirm, onCancel }: LogoutConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
         style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
         onClick={(e: React.MouseEvent<HTMLDivElement>) =>
           e.target === e.currentTarget && onCancel()
         }>
      <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-6 text-center"
           style={{ animation: "cpFadeIn .25s ease" }}>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <h3 className="font-serif text-[17px] font-bold text-gray-800 mb-1">Sign Out?</h3>
        <p className="text-sm text-gray-700 mb-5">
          You'll need to log in again to access the dashboard.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all active:scale-95">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────
export default function Navbar({
  variant = "dashboard",
  moduleName = "",
  moduleSubtitle = "Restaurant Management System",
}: NavbarProps) {
  const navigate = useNavigate();

  const [openMenu, setOpenMenu]         = useState<"account" | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showLogout, setShowLogout]     = useState<boolean>(false);

  const accountRef = useRef<HTMLDivElement | null>(null);

  const adminName = "Yuvraj Patil";
  const adminRole = "Super Admin";

  const initials = adminName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (accountRef.current && !accountRef.current.contains(target))
        setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // MODULE VARIANT
  if (variant === "module") {
    return (
      <div className="w-full bg-emerald-700 px-4 sm:px-8 py-4 flex items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-[26px] font-serif text-white tracking-wide">
            {moduleName}
          </h1>
          <p className="text-[10px] sm:text-[11px] text-white/70 tracking-[2px] uppercase mt-1 font-semibold">
            {moduleSubtitle}
          </p>
        </div>
      </div>
    );
  }

  // DASHBOARD VARIANT
  return (
    <>
      <style>{`
        @keyframes cpFadeIn    { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        @keyframes cpSlideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="w-full bg-white/5 backdrop-blur-sm px-4 sm:px-8 py-4 flex items-center justify-between gap-3 text-[#b2d1df]">

        {/* Left — Brand */}
        <h1 className="text-xl font-serif text-gray-100">🍽️ Sync Restaurant</h1>

        {/* Right — Icons */}
        <div className="flex items-center gap-2">

          {/* ⚙️ Settings icon — clicking navigates directly to /settings */}
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-full hover:bg-white/10 cursor-pointer transition-colors"
          >
            <Settings size={20} />
          </button>

          {/* 👤 Account */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setOpenMenu(openMenu === "account" ? null : "account")}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white/30 group-hover:border-white/60 transition-colors"
                   style={{ background: "linear-gradient(135deg,#d97706,#b45309)" }}>
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-white text-[12px] font-semibold leading-tight">{adminName}</p>
                <p className="text-white/60 text-[10px] leading-tight">{adminRole}</p>
              </div>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="2.5" strokeLinecap="round"
                   className={`transition-transform duration-200 opacity-60 ${openMenu === "account" ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {openMenu === "account" && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-100 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                   style={{ animation: "cpSlideDown .2s ease" }}>
                <div className="px-4 py-4 bg-linear-to-br from-emerald-50 to-white border-b border-gray-100 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 border-amber-200 shadow-sm"
                       style={{ background: "linear-gradient(135deg,#d97706,#b45309)" }}>
                    <span className="text-white text-base font-bold">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-[14px] truncate"
                       style={{ fontFamily: "'Playfair Display',serif" }}>
                      {adminName}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{adminRole}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ● Active
                    </span>
                  </div>
                </div>

                <div className="py-1.5">
                  <button
                    onClick={() => { setOpenMenu(null); setShowPassword(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="#d97706" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-gray-700">Change Password</p>
                      <p className="text-[10px] text-gray-400">Update your credentials</p>
                    </div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                         stroke="#d1d5db" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>

                <div className="border-t border-gray-100 p-2">
                  <button
                    onClick={() => { setOpenMenu(null); setShowLogout(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                    </div>
                    <p className="text-[13px] font-semibold text-red-500">Sign Out</p>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {showPassword && <ChangePasswordModal onClose={() => setShowPassword(false)} />}
      {showLogout && (
        <LogoutConfirm
          onConfirm={() => setShowLogout(false)}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
}
