import { useState, useEffect, useCallback } from "react";
import BackButton from "../components/BackButton.js";
import Navbar from "../components/Navbar.js";

const API = "http://localhost:8080/api/inventory";

// ─── TYPES ───────────────────────────────────────────────────────────
type Item = {
  id: number;
  name: string;
  unit: string;
  stock: number;
  minQty: number;
};

type LogEntry = {
  id: number;
  type: "IN" | "OUT";
  name: string;
  qty: number;
  unit: string;
  time: string;
};

type ModalType = { type: "IN" | "OUT" } | null;

// ─── Low Stock Alert ─────────────────────────────────────────────────
function LowStockAlert({
  alerts,
  onDismiss,
}: {
  alerts: Item[];
  onDismiss: (id: number) => void;
}) {
  if (!alerts.length) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none"
      style={{ paddingTop: "5rem" }}
    >
      <div className="flex flex-col gap-3 pointer-events-auto w-full max-w-md px-4">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 rounded-2xl p-4 shadow-2xl border"
            style={{
              background: "linear-gradient(135deg,#fff7ed 0%,#fff 100%)",
              borderColor: "#fb923c",
              animation: "slideDown .35s cubic-bezier(.22,1,.36,1)",
            }}
          >
            <span className="text-2xl mt-0.5">⚠️</span>
            <div className="flex-1 min-w-0">
              <p
                className="font-bold text-orange-700"
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "1rem",
                }}
              >
                Low Stock Alert
              </p>
              <p className="text-sm text-orange-600 mt-0.5">
                <span className="font-semibold">{a.name}</span> is running
                low!&nbsp; Only{" "}
                <span className="font-bold">
                  {a.stock} {a.unit}
                </span>{" "}
                remaining (min: {a.minQty} {a.unit}). Please restock soon.
              </p>
            </div>
            <button
              onClick={() => onDismiss(a.id)}
              className="text-orange-400 hover:text-orange-700 transition-colors text-lg leading-none mt-0.5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Log Row ─────────────────────────────────────────────────────────
function LogRow({ entry }: { entry: LogEntry }) {
  const isIn = entry.type === "IN";
  return (
    <div
      className="flex items-center gap-3 py-2.5 px-4 rounded-xl"
      style={{ background: isIn ? "#f0fdf4" : "#fff7ed" }}
    >
      <span
        className="w-16 text-center text-xs font-bold uppercase tracking-widest rounded-full py-1"
        style={{
          background: isIn ? "#bbf7d0" : "#fed7aa",
          color: isIn ? "#15803d" : "#c2410c",
        }}
      >
        {isIn ? "Stock In" : "Used"}
      </span>
      <span
        className="flex-1 font-medium text-gray-700"
        style={{ fontFamily: "'Playfair Display',serif" }}
      >
        {entry.name}
      </span>
      <span
        className={`font-bold ${isIn ? "text-green-600" : "text-orange-600"}`}
      >
        {isIn ? "+" : "−"}
        {entry.qty} {entry.unit}
      </span>
      <span className="text-xs text-gray-400 w-20 text-right">
        {entry.time}
      </span>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-xl px-4 py-3 flex flex-col justify-between shadow-sm border border-gray-100 bg-white">
      <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
        {label}
      </span>
      <span
        className="text-3xl font-black"
        style={{ fontFamily: "'Playfair Display',serif", color: accent }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────
export default function InventoryManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string>("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<Item[]>([]);
  const [dismissedIds, setDismissed] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [modal, setModal] = useState<ModalType>(null);
  const [addItemModal, setAddItemModal] = useState<boolean>(false);
  const [form, setForm] = useState<{ itemId: string; qty: string }>({
    itemId: "",
    qty: "",
  });
  const [newItem, setNewItem] = useState<{
    name: string;
    unit: string;
    stock: string;
    minQty: string;
  }>({
    name: "",
    unit: "kg",
    stock: "0",
    minQty: "",
  });
  const [formErr, setFormErr] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // ── Fetch all items from backend ──
  const fetchItems = useCallback(async () => {
    try {
      setApiError("");
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to load inventory.");
      const data: Item[] = await res.json();
      setItems(data);
    } catch (e: any) {
      setApiError(e.message || "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setAlerts(
      items.filter((i) => i.stock <= i.minQty && !dismissedIds.has(i.id)),
    );
  }, [items, dismissedIds]);

  const dismissAlert = (id: number) => setDismissed((p) => new Set([...p, id]));

  const now = () =>
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ── Stock In / Mark Used ──
  const handleTransaction = async () => {
    setFormErr("");
    const item = items.find((i) => i.id === Number(form.itemId));
    const qty = parseFloat(form.qty);

    if (!item) return setFormErr("Please select an item.");
    if (!qty || qty <= 0) return setFormErr("Enter a valid quantity.");
    if (modal?.type === "OUT" && qty > item.stock)
      return setFormErr(`Only ${item.stock} ${item.unit} available.`);

    const endpoint =
      modal?.type === "IN"
        ? `${API}/${item.id}/stock-in`
        : `${API}/${item.id}/mark-used`;

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty }),
      });

      if (!res.ok) {
        const err = await res.json();
        return setFormErr(err.error || "Transaction failed.");
      }

      const updated: Item = await res.json();

      // Update item in local state with fresh data from backend
      setItems((p) => p.map((i) => (i.id === updated.id ? updated : i)));

      setLog((p) => [
        {
          id: Date.now(),
          type: modal!.type,
          name: item.name,
          qty,
          unit: item.unit,
          time: now(),
        },
        ...p,
      ]);

      if (modal?.type === "IN") {
        setDismissed((p) => {
          const n = new Set(p);
          n.delete(item.id);
          return n;
        });
      }

      setModal(null);
      setForm({ itemId: "", qty: "" });
    } catch {
      setFormErr("Network error. Please try again.");
    }
  };

  // ── Add New Item ──
  const handleAddItem = async () => {
    setFormErr("");
    if (!newItem.name.trim()) return setFormErr("Item name is required.");
    if (!newItem.minQty || parseFloat(newItem.minQty) < 0)
      return setFormErr("Enter a valid minimum quantity.");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItem.name.trim(),
          unit: newItem.unit,
          stock: parseFloat(newItem.stock) || 0,
          minQty: parseFloat(newItem.minQty),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        return setFormErr(err.error || "Failed to add item.");
      }

      const created: Item = await res.json();
      setItems((p) => [...p, created]);
      setAddItemModal(false);
      setNewItem({ name: "", unit: "kg", stock: "0", minQty: "" });
    } catch {
      setFormErr("Network error. Please try again.");
    }
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );
  const lowCount = items.filter((i) => i.stock <= i.minQty).length;
  const todayIn = log
    .filter((l) => l.type === "IN")
    .reduce((s, l) => s + l.qty, 0);
  const todayUsed = log
    .filter((l) => l.type === "OUT")
    .reduce((s, l) => s + l.qty, 0);

  const inp =
    "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white";

  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ background: "#faf9f6", fontFamily: "'DM Sans',sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap%27);
        @keyframes slideDown { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0;transform:scale(.97)}        to{opacity:1;transform:scale(1)}    }
        @keyframes spin      { to { transform: rotate(360deg); } }
        .card-hover { transition:box-shadow .2s,transform .2s; }
        .card-hover:hover { box-shadow:0 8px 32px rgba(0,0,0,.10); transform:translateY(-2px); }
        .stock-scroll::-webkit-scrollbar { width:4px; }
        .stock-scroll::-webkit-scrollbar-track { background:#f5f5f4; border-radius:99px; }
        .stock-scroll::-webkit-scrollbar-thumb { background:#d6d3d1; border-radius:99px; }
        .stock-scroll::-webkit-scrollbar-thumb:hover { background:#a8a29e; }
        .spinner { width:32px;height:32px;border:3px solid #fde68a;border-top-color:#d97706;border-radius:50%;animation:spin .7s linear infinite; }
      `}</style>

      <LowStockAlert alerts={alerts} onDismiss={dismissAlert} />
      <Navbar variant="module" moduleName="Menu Manager" />

      {/* TAB BAR */}
      <div className="bg-white border-b border-gray-200 shadow-sm mt-1">
        <div className="w-full px-6 flex">
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "log", label: "Today's Log" },
            { key: "items", label: "Items" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="relative px-6 py-4 text-base font-bold transition-all"
              style={{ color: activeTab === key ? "#d97706" : "#78716c" }}
            >
              {label}
              {activeTab === key && (
                <span
                  className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full"
                  style={{ background: "#d97706" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 flex items-center justify-between gap-3">
          <span className="text-sm text-red-600 font-medium">⚠ {apiError}</span>
          <button
            onClick={fetchItems}
            className="text-xs font-bold text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="w-full px-4 sm:px-6 py-4 flex-1 overflow-hidden">
        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="spinner" />
            <p className="text-sm text-gray-400 font-medium">
              Loading inventory...
            </p>
          </div>
        ) : (
          <>
            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <div style={{ animation: "fadeIn .4s ease" }}>
                <div className="grid grid-cols-4 gap-3 mb-4 w-full">
                  <StatCard
                    label="Total Items"
                    value={items.length}
                    accent="#1c1917"
                  />
                  <StatCard
                    label="Low Stock"
                    value={lowCount}
                    accent={lowCount ? "#ea580c" : "#16a34a"}
                  />
                  <StatCard
                    label="Stocked Today"
                    value={todayIn.toFixed(1)}
                    accent="#16a34a"
                  />
                  <StatCard
                    label="Used Today"
                    value={todayUsed.toFixed(1)}
                    accent="#ea580c"
                  />
                </div>

                <div className="max-w-6xl mx-auto">
                  <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                    <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <h2
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                        }}
                      >
                        Current Stock
                      </h2>
                      <div className="relative flex-1 min-w-50 max-w-sm">
                        <svg
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                        />
                        {search && (
                          <button
                            onClick={() => setSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setModal({ type: "IN" });
                            setFormErr("");
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                          style={{
                            background:
                              "linear-gradient(135deg,#16a34a,#15803d)",
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Stock In
                        </button>
                        <button
                          onClick={() => {
                            setModal({ type: "OUT" });
                            setFormErr("");
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                          style={{
                            background:
                              "linear-gradient(135deg,#ea580c,#c2410c)",
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Mark Used
                        </button>
                        <button
                          onClick={() => {
                            setAddItemModal(true);
                            setFormErr("");
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95"
                          style={{
                            color: "#d97706",
                            borderColor: "#fde68a",
                            background: "#fffbeb",
                          }}
                        >
                          + Add Item
                        </button>
                      </div>
                    </div>

                    <div
                      className="stock-scroll overflow-y-auto divide-y divide-gray-50"
                      style={{ maxHeight: "calc(100vh - 380px)" }}
                    >
                      {filteredItems.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                          <p className="text-3xl mb-2">🔍</p>
                          <p className="font-medium text-sm">
                            No items match "
                            <span className="text-gray-600">{search}</span>"
                          </p>
                        </div>
                      ) : (
                        filteredItems.map((item) => {
                          const pct = Math.min(
                            (item.stock / (item.minQty * 4)) * 100,
                            100,
                          );
                          const isLow = item.stock <= item.minQty;
                          return (
                            <div
                              key={item.id}
                              className="px-5 py-4 flex items-center gap-4 card-hover"
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                                style={{
                                  background: isLow ? "#fff7ed" : "#f0fdf4",
                                }}
                              >
                                {isLow ? "⚠️" : "✅"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-semibold text-gray-800 text-base"
                                    style={{
                                      fontFamily: "'Playfair Display',serif",
                                    }}
                                  >
                                    {item.name}
                                  </span>
                                  {isLow && (
                                    <span
                                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                                      style={{
                                        background: "#fee2e2",
                                        color: "#b91c1c",
                                      }}
                                    >
                                      LOW
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${pct}%`,
                                        background: isLow
                                          ? "#f97316"
                                          : "#22c55e",
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400 shrink-0">
                                    min {item.minQty} {item.unit}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p
                                  className={`text-2xl font-black ${isLow ? "text-orange-600" : "text-gray-800"}`}
                                  style={{
                                    fontFamily: "'Playfair Display',serif",
                                  }}
                                >
                                  {item.stock}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {item.unit}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TODAY'S LOG */}
            {activeTab === "log" && (
              <div style={{ animation: "fadeIn .4s ease" }}>
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h2
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontWeight: 700,
                        fontSize: "1.05rem",
                      }}
                    >
                      Today's Transactions
                    </h2>
                  </div>
                  {log.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                      <p className="text-4xl mb-3">📋</p>
                      <p className="font-medium">No transactions yet today.</p>
                      <p className="text-sm mt-1">
                        Use "Stock In" or "Mark Used" to log activity.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="stock-scroll overflow-y-auto p-3 flex flex-col gap-2"
                      style={{ maxHeight: "480px" }}
                    >
                      {log.map((e) => (
                        <LogRow key={e.id} entry={e} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ITEMS */}
            {activeTab === "items" && (
              <div style={{ animation: "fadeIn .4s ease" }}>
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                    <h2
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontWeight: 700,
                        fontSize: "1.05rem",
                      }}
                    >
                      All Items & Triggers
                    </h2>
                    <button
                      onClick={() => {
                        setAddItemModal(true);
                        setFormErr("");
                      }}
                      className="text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div
                    className="stock-scroll overflow-y-auto"
                    style={{ maxHeight: "480px" }}
                  >
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-100">
                          {[
                            "Item",
                            "Unit",
                            "Current Stock",
                            "Min Trigger",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400 font-semibold"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {items.map((item) => {
                          const isLow = item.stock <= item.minQty;
                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td
                                className="px-4 py-3 font-semibold text-gray-700"
                                style={{
                                  fontFamily: "'Playfair Display',serif",
                                }}
                              >
                                {item.name}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {item.unit}
                              </td>
                              <td
                                className="px-4 py-3 font-bold"
                                style={{ color: isLow ? "#ea580c" : "#16a34a" }}
                              >
                                {item.stock} {item.unit}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {item.minQty} {item.unit}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                                  style={{
                                    background: isLow ? "#fee2e2" : "#dcfce7",
                                    color: isLow ? "#b91c1c" : "#15803d",
                                  }}
                                >
                                  {isLow ? "⚠ Low" : "✓ OK"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Stock In / Mark Used Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6"
            style={{ animation: "fadeIn .25s ease" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: modal.type === "IN" ? "#15803d" : "#c2410c",
                }}
              >
                {modal.type === "IN" ? "➕ Stock In" : "➖ Mark As Used"}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  Item
                </label>
                <select
                  className={inp}
                  value={form.itemId}
                  onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                >
                  <option value="">— Select item —</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.stock} {i.unit} available)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  Quantity (
                  {form.itemId
                    ? items.find((i) => i.id === Number(form.itemId))?.unit
                    : "unit"}
                  )
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 10"
                  className={inp}
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: e.target.value })}
                />
              </div>
              {formErr && (
                <p className="text-xs text-red-600 font-medium">{formErr}</p>
              )}
              <button
                onClick={handleTransaction}
                className="mt-1 w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 shadow"
                style={{
                  background:
                    modal.type === "IN"
                      ? "linear-gradient(135deg,#16a34a,#15803d)"
                      : "linear-gradient(135deg,#ea580c,#c2410c)",
                }}
              >
                {modal.type === "IN" ? "Add to Stock" : "Deduct from Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addItemModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6"
            style={{ animation: "fadeIn .25s ease" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                }}
              >
                📦 New Item
              </h3>
              <button
                onClick={() => setAddItemModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chicken"
                  className={inp}
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Unit
                  </label>
                  <select
                    className={inp}
                    value={newItem.unit}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                  >
                    {["kg", "g", "L", "ml", "pcs", "dozen", "pack"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Opening Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    className={inp}
                    value={newItem.stock}
                    onChange={(e) =>
                      setNewItem({ ...newItem, stock: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  Min Qty Trigger
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 5"
                  className={inp}
                  value={newItem.minQty}
                  onChange={(e) =>
                    setNewItem({ ...newItem, minQty: e.target.value })
                  }
                />
                <p className="text-xs text-gray-400 mt-1">
                  Alert fires when stock drops to this level.
                </p>
              </div>
              {formErr && (
                <p className="text-xs text-red-600 font-medium">{formErr}</p>
              )}
              <button
                onClick={handleAddItem}
                className="mt-1 w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 shadow"
                style={{
                  background: "linear-gradient(135deg,#d97706,#b45309)",
                }}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 bg-[#faf9f6] border-t border-gray-100 px-4 py-2">
        <BackButton to="/dashboard" />
      </div>
    </div>
  );
}
