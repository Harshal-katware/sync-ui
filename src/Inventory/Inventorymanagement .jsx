import { useState, useEffect, useRef } from "react";
import BackButton from "../components/BackButton";

// ─── Dummy seed data ───────────────────────────────────────────────────────────
const SEED_ITEMS = [
  { id: 1, name: "Paneer",    unit: "kg",  stock: 18, minQty: 5  },
  { id: 2, name: "Tomatoes",  unit: "kg",  stock: 12, minQty: 4  },
  { id: 3, name: "Onions",    unit: "kg",  stock: 30, minQty: 8  },
  { id: 4, name: "Rice",      unit: "kg",  stock: 50, minQty: 10 },
  { id: 5, name: "Milk",      unit: "L",   stock: 3,  minQty: 5  },
  { id: 6, name: "Butter",    unit: "kg",  stock: 2,  minQty: 3  },
];

// ─── Notification popup ────────────────────────────────────────────────────────
function LowStockAlert({ alerts, onDismiss }) {
  if (!alerts.length) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none"
         style={{ paddingTop: "5rem" }}>
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
              <p className="font-bold text-orange-700" style={{ fontFamily: "'Playfair Display',serif", fontSize:"1rem" }}>
                Low Stock Alert
              </p>
              <p className="text-sm text-orange-600 mt-0.5">
                <span className="font-semibold">{a.name}</span> is running low!&nbsp;
                Only <span className="font-bold">{a.stock} {a.unit}</span> remaining
                (min: {a.minQty} {a.unit}). Please restock soon.
              </p>
            </div>
            <button
              onClick={() => onDismiss(a.id)}
              className="text-orange-400 hover:text-orange-700 transition-colors text-lg leading-none mt-0.5"
              aria-label="Dismiss"
            >✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Log entry row ─────────────────────────────────────────────────────────────
function LogRow({ entry }) {
  const isIn = entry.type === "IN";
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all"
         style={{ background: isIn ? "#f0fdf4" : "#fff7ed" }}>
      <span
        className="w-16 text-center text-xs font-bold uppercase tracking-widest rounded-full py-1"
        style={{ background: isIn ? "#bbf7d0" : "#fed7aa", color: isIn ? "#15803d" : "#c2410c" }}
      >{isIn ? "Stock In" : "Used"}</span>
      <span className="flex-1 font-medium text-gray-700" style={{ fontFamily:"'Playfair Display',serif" }}>
        {entry.name}
      </span>
      <span className={`font-bold ${isIn ? "text-green-600" : "text-orange-600"}`}>
        {isIn ? "+" : "−"}{entry.qty} {entry.unit}
      </span>
      <span className="text-xs text-gray-400 w-20 text-right">{entry.time}</span>
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-1 shadow-sm border border-gray-100"
         style={{ background: "#fff" }}>
      <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">{label}</span>
      <span className="text-3xl font-black" style={{ fontFamily:"'Playfair Display',serif", color: accent }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function InventoryManagement() {
  const [items, setItems]         = useState(SEED_ITEMS);
  const [log, setLog]             = useState([]);
  const [alerts, setAlerts]       = useState([]);
  const [dismissedIds, setDismissed] = useState(new Set());
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | log | items
  const [modal, setModal]         = useState(null); // null | { type:"IN"|"OUT" }
  const [addItemModal, setAddItemModal] = useState(false);

  // form states
  const [form, setForm]           = useState({ itemId: "", qty: "", note: "" });
  const [newItem, setNewItem]     = useState({ name:"", unit:"kg", stock:"0", minQty:"" });
  const [formErr, setFormErr]     = useState("");

  // low-stock check every time items change
  useEffect(() => {
    const lowItems = items.filter(
      (i) => i.stock <= i.minQty && !dismissedIds.has(i.id)
    );
    setAlerts(lowItems);
  }, [items, dismissedIds]);

  const dismissAlert = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const now = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const handleTransaction = () => {
    setFormErr("");
    const item = items.find((i) => i.id === Number(form.itemId));
    const qty  = parseFloat(form.qty);
    if (!item)           return setFormErr("Please select an item.");
    if (!qty || qty <= 0) return setFormErr("Enter a valid quantity.");
    if (modal.type === "OUT" && qty > item.stock)
      return setFormErr(`Only ${item.stock} ${item.unit} available in stock.`);

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, stock: modal.type === "IN" ? i.stock + qty : i.stock - qty }
          : i
      )
    );
    setLog((prev) => [
      { id: Date.now(), type: modal.type, name: item.name, qty, unit: item.unit, time: now() },
      ...prev,
    ]);
    // re-enable alert for this item if restocked above min
    if (modal.type === "IN") {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
    setModal(null);
    setForm({ itemId: "", qty: "", note: "" });
  };

  const handleAddItem = () => {
    setFormErr("");
    if (!newItem.name.trim())   return setFormErr("Item name is required.");
    if (!newItem.minQty || parseFloat(newItem.minQty) < 0)
                                return setFormErr("Enter a valid minimum quantity.");
    const id = Date.now();
    setItems((prev) => [
      ...prev,
      {
        id,
        name:   newItem.name.trim(),
        unit:   newItem.unit,
        stock:  parseFloat(newItem.stock) || 0,
        minQty: parseFloat(newItem.minQty),
      },
    ]);
    setAddItemModal(false);
    setNewItem({ name:"", unit:"kg", stock:"0", minQty:"" });
  };

  const lowCount    = items.filter((i) => i.stock <= i.minQty).length;
  const totalItems  = items.length;
  const todayIn     = log.filter((l) => l.type === "IN").reduce((s, l) => s + l.qty, 0);
  const todayUsed   = log.filter((l) => l.type === "OUT").reduce((s, l) => s + l.qty, 0);

  // ── Shared input style ─────────────────────────────────────────────────────
  const inp = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white";

  return (
    <div className="min-h-screen" style={{ background:"#faf9f6", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes slideDown { from { opacity:0; transform:translateY(-18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn    { from { opacity:0; transform:scale(.97);        } to { opacity:1; transform:scale(1);   } }
        .card-hover { transition: box-shadow .2s, transform .2s; }
        .card-hover:hover { box-shadow: 0 8px 32px rgba(0,0,0,.10); transform:translateY(-2px); }
      `}</style>

      {/* ── Low stock alerts ── */}
      <LowStockAlert alerts={alerts} onDismiss={dismissAlert} />

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-gray-200"
              style={{ background:"rgba(250,249,246,.92)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-600 font-bold">Hotel Management</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", fontWeight:900, color:"#1c1917" }}>
              Inventory Control
            </h1>
          </div>
          <div className="flex gap-2">
           
            <button
              onClick={() => { setModal({ type:"IN" }); setFormErr(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all active:scale-95"
              style={{ background:"linear-gradient(135deg,#16a34a,#15803d)" }}
            >
              <span className="text-base">＋</span> Stock In
            </button>
            <button
              onClick={() => { setModal({ type:"OUT" }); setFormErr(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all active:scale-95"
              style={{ background:"linear-gradient(135deg,#ea580c,#c2410c)" }}
            >
              <span className="text-base">−</span> Mark Used
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0">
          {["dashboard","log","items"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="px-4 py-2 text-sm font-semibold capitalize rounded-t-lg transition-all"
              style={{
                borderBottom: activeTab === t ? "2px solid #d97706" : "2px solid transparent",
                color: activeTab === t ? "#d97706" : "#78716c",
              }}
            >{t === "log" ? "Today's Log" : t}</button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div style={{ animation:"fadeIn .4s ease" }}>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Items"   value={totalItems}            accent="#1c1917" />
              <StatCard label="Low Stock"     value={lowCount}              accent={lowCount ? "#ea580c" : "#16a34a"} />
              <StatCard label="Stocked Today" value={`${todayIn.toFixed(1)}`}   accent="#16a34a" />
              <StatCard label="Used Today"    value={`${todayUsed.toFixed(1)}`} accent="#ea580c" />
            </div>

            {/* Inventory table */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
              <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"1.05rem" }}>
                  Current Stock
                </h2>
                <button
                  onClick={() => { setAddItemModal(true); setFormErr(""); }}
                  className="text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors"
                >+ Add Item</button>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item) => {
                  const pct   = Math.min((item.stock / (item.minQty * 4)) * 100, 100);
                  const isLow = item.stock <= item.minQty;
                  return (
                    <div key={item.id} className="px-5 py-4 flex items-center gap-4 card-hover">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                           style={{ background: isLow ? "#fff7ed" : "#f0fdf4" }}>
                        {isLow ? "⚠️" : "✅"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800" style={{ fontFamily:"'Playfair Display',serif" }}>
                            {item.name}
                          </span>
                          {isLow && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ background:"#fee2e2", color:"#b91c1c" }}>LOW</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                                 style={{ width:`${pct}%`, background: isLow ? "#f97316" : "#22c55e" }} />
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">
                            min {item.minQty} {item.unit}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xl font-black ${isLow ? "text-orange-600" : "text-gray-800"}`}
                           style={{ fontFamily:"'Playfair Display',serif" }}>
                          {item.stock}
                        </p>
                        <p className="text-xs text-gray-400">{item.unit}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TODAY'S LOG ── */}
        {activeTab === "log" && (
          <div style={{ animation:"fadeIn .4s ease" }}>
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"1.05rem" }}>
                  Today's Transactions
                </h2>
              </div>
              {log.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-medium">No transactions yet today.</p>
                  <p className="text-sm mt-1">Use "Stock In" or "Mark Used" to log activity.</p>
                </div>
              ) : (
                <div className="p-3 flex flex-col gap-2">
                  {log.map((entry) => <LogRow key={entry.id} entry={entry} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ITEMS ── */}
        {activeTab === "items" && (
          <div style={{ animation:"fadeIn .4s ease" }}>
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
              <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"1.05rem" }}>
                  All Items & Triggers
                </h2>
                <button
                  onClick={() => { setAddItemModal(true); setFormErr(""); }}
                  className="text-xs font-bold text-amber-600 hover:text-amber-800"
                >+ Add Item</button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Item","Unit","Current Stock","Min Trigger","Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => {
                    const isLow = item.stock <= item.minQty;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-700" style={{ fontFamily:"'Playfair Display',serif" }}>
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                        <td className="px-4 py-3 font-bold" style={{ color: isLow ? "#ea580c" : "#16a34a" }}>
                          {item.stock} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{item.minQty} {item.unit}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: isLow ? "#fee2e2" : "#dcfce7", color: isLow ? "#b91c1c" : "#15803d" }}>
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
        )}
      </main>

      {/* ─── Stock In / Mark Used modal ─────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background:"rgba(0,0,0,.45)", backdropFilter:"blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6"
               style={{ animation:"fadeIn .25s ease" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"1.2rem",
                           color: modal.type === "IN" ? "#15803d" : "#c2410c" }}>
                {modal.type === "IN" ? "➕ Stock In" : "➖ Mark As Used"}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Item</label>
                <select className={inp} value={form.itemId}
                        onChange={(e) => setForm({ ...form, itemId: e.target.value })}>
                  <option value="">— Select item —</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.name} ({i.stock} {i.unit} available)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  Quantity ({form.itemId ? items.find(i=>i.id===Number(form.itemId))?.unit : "unit"})
                </label>
                <input type="number" min="0" step="0.1" placeholder="e.g. 10"
                       className={inp} value={form.qty}
                       onChange={(e) => setForm({ ...form, qty: e.target.value })} />
              </div>
              {formErr && <p className="text-xs text-red-600 font-medium">{formErr}</p>}
              <button
                onClick={handleTransaction}
                className="mt-1 w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 shadow"
                style={{ background: modal.type === "IN"
                  ? "linear-gradient(135deg,#16a34a,#15803d)"
                  : "linear-gradient(135deg,#ea580c,#c2410c)" }}
              >
                {modal.type === "IN" ? "Add to Stock" : "Deduct from Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Item modal ──────────────────────────────────────────────────── */}
      {addItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background:"rgba(0,0,0,.45)", backdropFilter:"blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6"
               style={{ animation:"fadeIn .25s ease" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"1.2rem" }}>
                📦 New Item
              </h3>
              <button onClick={() => setAddItemModal(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Item Name</label>
                <input type="text" placeholder="e.g. Chicken"
                       className={inp} value={newItem.name}
                       onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Unit</label>
                  <select className={inp} value={newItem.unit}
                          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                    {["kg","g","L","ml","pcs","dozen","pack"].map((u)=>(
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Opening Stock</label>
                  <input type="number" min="0" step="0.1" placeholder="0"
                         className={inp} value={newItem.stock}
                         onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  Min Qty Trigger
                </label>
                <input type="number" min="0" step="0.1" placeholder="e.g. 5"
                       className={inp} value={newItem.minQty}
                       onChange={(e) => setNewItem({ ...newItem, minQty: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">Alert fires when stock drops to this level.</p>
              </div>
              {formErr && <p className="text-xs text-red-600 font-medium">{formErr}</p>}
              <button
                onClick={handleAddItem}
                className="mt-1 w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 shadow"
                style={{ background:"linear-gradient(135deg,#d97706,#b45309)" }}
              >Add Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}