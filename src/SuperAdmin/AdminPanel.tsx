
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Api/axiosInstance";

type SubStatus = "TRIAL" | "ACTIVE" | "EXPIRED";
type SubPlan = "TRIAL" | "BASIC" | "STANDARD" | "PREMIUM";

interface RestaurantUser {
  id: number;
  name: string;
  email: string;
  contactNumber: string;
  role: string;
  subscriptionStatus: SubStatus;
  subscriptionPlan: SubPlan;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
}

const STATUS_STYLE: Record<SubStatus, { dot: string; badge: string; bg: string }> = {
  TRIAL:   { dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-600 border-blue-200",     bg: "bg-blue-50"    },
  ACTIVE:  { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bg: "bg-emerald-50" },
  EXPIRED: { dot: "bg-red-400",     badge: "bg-red-50 text-red-600 border-red-200",         bg: "bg-red-50"     },
};

const PLAN_OPTIONS: { value: SubPlan; label: string; duration: string; price: string; color: string }[] = [
  { value: "TRIAL",    label: "Trial",    duration: "7 days",    price: "Free",   color: "border-blue-300 bg-blue-50 text-blue-700"        },
  { value: "BASIC",    label: "Basic",    duration: "3 months",  price: "₹999",   color: "border-amber-300 bg-amber-50 text-amber-700"     },
  { value: "STANDARD", label: "Standard", duration: "6 months",  price: "₹1,799", color: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  { value: "PREMIUM",  label: "Premium",  duration: "12 months", price: "₹2,999", color: "border-purple-300 bg-purple-50 text-purple-700"  },
];

// ── Activate Modal ─────────────────────────────────────────────────────────────
function ActivateModal({ user, onClose, onDone }: { user: RestaurantUser; onClose: () => void; onDone: () => void }) {
  const [plan, setPlan]       = useState<SubPlan>("BASIC");
  const [notes, setNotes]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      await axiosInstance.put(`/api/super-admin/users/${user.id}/activate`, { plan, notes });
      onDone(); onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to update subscription.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100" style={{ animation: "fadeUp .2s ease" }}>
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-gray-800">
              {user.subscriptionStatus === "ACTIVE" ? "✨ Extend Subscription" : "🚀 Activate Subscription"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{user.name} · {user.email}</p>
        </div>

        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Select Plan</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
          {PLAN_OPTIONS.map((p) => (
          <button key={p.value} onClick={() => setPlan(p.value)}
          className={`py-3 px-3 rounded-xl border-2 text-left transition-all ${
          plan === p.value ? p.color + " border-2" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}>
          <div className="font-bold text-sm">{p.label}</div>
          <div className="text-[11px] opacity-70 mt-0.5">{p.duration}</div>
          <div className="text-sm font-black mt-1">{p.price}</div>
          </button>
         ))}
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Notes (optional)</p>
          <input type="text" placeholder="e.g. UPI paid ₹999"
            value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all mb-4" />

          {error && <p className="text-red-500 text-xs mb-3 flex items-center gap-1">⚠ {error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition disabled:opacity-60 active:scale-95">
              {loading ? "Saving..." : user.subscriptionStatus === "ACTIVE" ? "Extend" : "Activate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Deactivate Modal ───────────────────────────────────────────────────────────
function DeactivateModal({ user, onClose, onDone }: { user: RestaurantUser; onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try { await axiosInstance.put(`/api/super-admin/users/${user.id}/deactivate`); onDone(); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-red-100 p-6" style={{ animation: "fadeUp .2s ease" }}>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⛔</span>
        </div>
        <h2 className="text-[17px] font-bold text-gray-800 text-center mb-1">Deactivate User?</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          <span className="font-semibold text-gray-700">{user.name}</span>'s subscription will be marked as <span className="text-red-500 font-semibold">EXPIRED</span>.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition disabled:opacity-60 active:scale-95">
            {loading ? "..." : "Yes, Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create User Modal ──────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    name: "", email: "", contactNumber: "", password: "",
    role: "ADMIN", subscriptionPlan: "TRIAL" as SubPlan, subscriptionStatus: "TRIAL" as SubStatus,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try { await axiosInstance.post("/api/super-admin/users", form); onDone(); onClose(); }
    catch (e: any) { setError(e?.response?.data?.error || "Failed to create user."); }
    finally { setLoading(false); }
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all";
  const lbl = "block text-[10px] text-gray-400 uppercase tracking-[1.5px] mb-1.5 font-semibold";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100" style={{ animation: "fadeUp .2s ease" }}>
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-gray-800">➕ Create New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3.5">
          <div>
            <label className={lbl}>Full Name</label>
            <input type="text" name="name" placeholder="Hotel Name" value={form.name} onChange={handleChange} className={inp} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input type="email" name="email" placeholder="email@hotel.com" value={form.email} onChange={handleChange} className={inp} />
          </div>
          <div>
            <label className={lbl}>Contact Number</label>
            <input type="text" name="contactNumber" placeholder="10-digit number" value={form.contactNumber} onChange={handleChange} className={inp} maxLength={10} />
          </div>
          <div>
            <label className={lbl}>Password</label>
            <input type="password" name="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} className={inp} />
          </div>
          <div>
            <label className={lbl}>Subscription Plan</label>
            <select name="subscriptionPlan" value={form.subscriptionPlan} onChange={handleChange} className={inp}>
              <option value="TRIAL">Trial (7 days)</option>
              <option value="BASIC">Basic (3 months)</option>
              <option value="STANDARD">Standard (6 months)</option>
              <option value="PREMIUM">Premium (12 months)</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-xs flex items-center gap-1">⚠ {error}</p>}
          <div className="flex gap-3 mt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition disabled:opacity-60 active:scale-95">
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── User Card (Mobile) ─────────────────────────────────────────────────────────
function UserCard({ user, onActivate, onDeactivate }: { user: RestaurantUser; onActivate: () => void; onDeactivate: () => void }) {
  const st = STATUS_STYLE[user.subscriptionStatus];
  const d  = user.subscriptionEnd
    ? Math.ceil((new Date(user.subscriptionEnd).getTime() - Date.now()) / 86400000)
    : null;
  const fmt = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-base shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          {user.subscriptionStatus}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {user.subscriptionPlan}
        </span>
        <span className="text-xs text-gray-400">📅 {fmt(user.subscriptionEnd)}</span>
        {d !== null && (
          <span className={`text-xs font-bold ${d <= 3 ? "text-red-500" : d <= 7 ? "text-amber-500" : "text-gray-500"}`}>
            {d > 0 ? `${d}d left` : "Expired"}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onActivate}
          className="flex-1 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition">
          {user.subscriptionStatus === "ACTIVE" ? "Extend" : "Activate"}
        </button>
        {user.subscriptionStatus !== "EXPIRED" && (
          <button onClick={onDeactivate}
            className="flex-1 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition">
            Deactivate
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const [users,            setUsers]            = useState<RestaurantUser[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState("");
  const [search,           setSearch]           = useState("");
  const [filterStatus,     setFilterStatus]     = useState<"ALL" | SubStatus>("ALL");
  const [showCreateModal,  setShowCreateModal]  = useState(false);
  const [activateTarget,   setActivateTarget]   = useState<RestaurantUser | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<RestaurantUser | null>(null);

  const userRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole") || "";

  useEffect(() => {
    if (userRole !== "SUPER_ADMIN") navigate("/dashboard");
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axiosInstance.get("/api/super-admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const regularUsers = users.filter((u) => u.role !== "SUPER_ADMIN");
  const filtered = regularUsers.filter((u) => {
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) ||
               u.email.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus === "ALL" || u.subscriptionStatus === filterStatus;
    return ms && mf;
  });

  const counts = {
    total:   regularUsers.length,
    active:  regularUsers.filter((u) => u.subscriptionStatus === "ACTIVE").length,
    trial:   regularUsers.filter((u) => u.subscriptionStatus === "TRIAL").length,
    expired: regularUsers.filter((u) => u.subscriptionStatus === "EXPIRED").length,
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const daysLeft = (end: string | null) =>
    end ? Math.ceil((new Date(end).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Header ── */}
      <div className=" px-4 sm:px-8 py-4 flex items-center gap-3 shadow-sm"
      style={{ background: "linear-gradient(to right, #1a4a4a, #0d6e5f)" }}>
        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white/80 hover:text-white transition text-sm font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div className="h-5 w-px bg-white/20" />
        <div>
          <h1 className="text-xl sm:text-[22px] font-serif text-white tracking-wide">👑 Admin Panel</h1>
          <p className="text-[10px] text-white/60 tracking-[2px] uppercase font-semibold">Super Admin · Subscription Management</p>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Users", value: counts.total,   color: "text-gray-800",    icon: "👥" },
            { label: "Active",      value: counts.active,  color: "text-emerald-600", icon: "✅" },
            { label: "Trial",       value: counts.trial,   color: "text-blue-600",    icon: "🔵" },
            { label: "Expired",     value: counts.expired, color: "text-red-500",     icon: "❌" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{s.icon}</span>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{s.label}</p>
              </div>
              <p className={`text-3xl font-black ${s.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search by name or email..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition">
            <option value="ALL">All Status</option>
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <button onClick={fetchUsers}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white hover:bg-gray-50 transition font-medium">
            🔄 Refresh
          </button>
          <button onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5  text-white rounded-xl text-sm font-bold transition active:scale-95 shadow-sm"
            style={{
              background: "linear-gradient(to right, #1b4332, #0f766e)"
                }}>
            ➕ Add User
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-5 text-sm">⚠ {error}</div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center h-48 items-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* ── Desktop Table ── */}
        {!loading && (
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["#", "Name", "Email / Contact", "Plan", "Status", "Expires", "Days Left", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10.5px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                      <p className="text-3xl mb-2">🔍</p>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((u, i) => {
                    const st = STATUS_STYLE[u.subscriptionStatus];
                    const d  = daysLeft(u.subscriptionEnd);
                    return (
                      <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-800">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-gray-700 text-xs">{u.email}</div>
                          <div className="text-gray-400 text-xs mt-0.5">{u.contactNumber}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                            {u.subscriptionPlan}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {u.subscriptionStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600 text-xs">{fmt(u.subscriptionEnd)}</td>
                        <td className="px-5 py-4 text-xs">
                          {d !== null ? (
                            <span className={`font-bold ${d <= 3 ? "text-red-500" : d <= 7 ? "text-amber-500" : "text-gray-500"}`}>
                              {d > 0 ? `${d} days` : "Expired"}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => setActivateTarget(u)}
                              className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition">
                              {u.subscriptionStatus === "ACTIVE" ? "Extend" : "Activate"}
                            </button>
                            {u.subscriptionStatus !== "EXPIRED" && (
                              <button onClick={() => setDeactivateTarget(u)}
                                className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Mobile Cards ── */}
        {!loading && (
          <div className="md:hidden space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">
                <p className="text-3xl mb-2">🔍</p>
                No users found
              </div>
            )}
            {filtered.map((u) => (
              <UserCard key={u.id} user={u}
                onActivate={() => setActivateTarget(u)}
                onDeactivate={() => setDeactivateTarget(u)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {activateTarget && (
        <ActivateModal user={activateTarget} onClose={() => setActivateTarget(null)} onDone={fetchUsers} />
      )}
      {deactivateTarget && (
        <DeactivateModal user={deactivateTarget} onClose={() => setDeactivateTarget(null)} onDone={fetchUsers} />
      )}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} onDone={fetchUsers} />
      )}
    </div>
  );
}
