import { useState, useMemo } from "react";

const MENU_ITEMS = [
  { id: 1, name: "Butter Milk", price: 30, cat: "drink", emoji: "🥛" },
  { id: 2, name: "Butter Kulcha", price: 50, cat: "veg", emoji: "🫓" },
  { id: 3, name: "Kaju Paneer Masala", price: 220, cat: "veg", emoji: "🧆" },
  { id: 4, name: "Dal Makhani", price: 180, cat: "veg", emoji: "🍲" },
  { id: 5, name: "Chicken Tikka", price: 280, cat: "nonveg", emoji: "🍗" },
  { id: 6, name: "Mutton Curry", price: 320, cat: "nonveg", emoji: "🍛" },
  { id: 7, name: "Roti", price: 15, cat: "veg", emoji: "🫓" },
  { id: 8, name: "Naan", price: 25, cat: "veg", emoji: "🫓" },
  { id: 9, name: "Lassi", price: 60, cat: "drink", emoji: "🥤" },
  { id: 10, name: "Cold Drink", price: 40, cat: "drink", emoji: "🧃" },
  { id: 11, name: "Paneer Tikka", price: 200, cat: "veg", emoji: "🧀" },
  { id: 12, name: "Veg Biryani", price: 160, cat: "veg", emoji: "🍚" },
  { id: 13, name: "Chicken Biryani", price: 240, cat: "nonveg", emoji: "🍚" },
  { id: 14, name: "Raita", price: 40, cat: "veg", emoji: "🥣" },
  { id: 15, name: "Gulab Jamun", price: 50, cat: "veg", emoji: "🍮" },
];

const INITIAL_TABLES = [
  ...Array.from({ length: 11 }, (_, i) => ({ id: i + 1, name: `Table ${i + 1}`, zone: "HALL" })),
  ...Array.from({ length: 5 }, (_, i) => ({ id: i + 12, name: `Table ${i + 12}`, zone: "FAMILY" })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: i + 31, name: `Bill ${i + 31}`, zone: "PARCEL" })),
];

const ZONE_COLORS = {
  HALL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAMILY: "bg-amber-50 text-amber-700 border-amber-200",
  PARCEL: "bg-blue-50 text-blue-700 border-blue-200",
};

const CAT_BADGE = {
  veg: "bg-green-100 text-green-700",
  nonveg: "bg-red-100 text-red-700",
  drink: "bg-blue-100 text-blue-700",
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg }) {
  return (
    <div className="fixed top-4 right-4 z-[200] bg-emerald-700 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg animate-bounce-in">
      {msg}
    </div>
  );
}

export default function RestaurantPOS() {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [menuItems, setMenuItems] = useState(MENU_ITEMS);
  const [orders, setOrders] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [zone, setZone] = useState("all");
  const [menuCat, setMenuCat] = useState("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [nextTableId, setNextTableId] = useState(100);

  // --- form state for modals
  const [form, setForm] = useState({});

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const currentOrder = selectedTable ? orders[selectedTable] || [] : [];

  const setCurrentOrder = (arr) => {
    if (!selectedTable) return;
    setOrders((prev) => ({ ...prev, [selectedTable]: arr }));
  };

  const addToOrder = (menuId) => {
    if (!selectedTable) { notify("⚠️ Pehle table select karein!"); return; }
    const m = menuItems.find((x) => x.id === menuId);
    if (!m) return;
    const ord = [...currentOrder];
    const ex = ord.find((x) => x.menuId === menuId);
    if (ex) { ex.qty += 1; setCurrentOrder([...ord]); }
    else setCurrentOrder([...ord, { menuId, name: m.name, price: m.price, qty: 1, emoji: m.emoji }]);
  };

  const changeQty = (menuId, d) => {
    const ord = currentOrder.map((x) => x.menuId === menuId ? { ...x, qty: Math.max(1, x.qty + d) } : x);
    setCurrentOrder(ord);
  };

  const removeItem = (menuId) => setCurrentOrder(currentOrder.filter((x) => x.menuId !== menuId));

  const subtotal = currentOrder.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt = subtotal * (Math.min(100, Math.max(0, discount)) / 100);
  const afterDisc = subtotal - discAmt;
  const gst = afterDisc * 0.05;
  const total = afterDisc + gst;

  const filteredMenu = useMemo(() =>
    menuItems.filter((m) =>
      (menuCat === "all" || m.cat === menuCat) &&
      (!menuSearch || m.name.toLowerCase().includes(menuSearch.toLowerCase()))
    ), [menuItems, menuCat, menuSearch]);

  const filteredTables = tables.filter((t) => zone === "all" || t.zone === zone);

  const occupiedCount = tables.filter((t) => (orders[t.id] || []).length > 0).length;

  const settleBill = () => {
    if (!selectedTable) { notify("⚠️ Table select karein!"); return; }
    if (!currentOrder.length) { notify("⚠️ Order empty hai!"); return; }
    setRevenue((r) => r + Math.round(total));
    setOrders((prev) => ({ ...prev, [selectedTable]: [] }));
    setDiscount(0);
    notify(`✅ ₹${total.toFixed(0)} Settle ho gaya!`);
  };

  const printKOT = () => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order empty hai!"); return; }
    notify("🖨️ KOT Print hua!");
  };

  const saveBill = () => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order empty hai!"); return; }
    notify("💾 Bill Save hua!");
  };

  const printBill = () => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order empty hai!"); return; }
    notify("🖨️ Bill Print hua!");
  };

  // --- CRUD modals
  const openAddTable = () => { setForm({ name: "", zone: "HALL" }); setModal("addTable"); };
  const openAddMenu = () => { setForm({ name: "", price: "", cat: "veg", emoji: "🍽️" }); setModal("addMenu"); };
  const openEditMenu = (item) => { setForm({ ...item }); setModal("editMenu"); };

  const handleAddTable = () => {
    if (!form.name.trim()) { notify("⚠️ Table naam daalein!"); return; }
    const id = nextTableId;
    setNextTableId((n) => n + 1);
    setTables((prev) => [...prev, { id, name: form.name.trim(), zone: form.zone }]);
    setModal(null);
    notify("✅ Table add hua!");
  };

  const handleDeleteTable = (id) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    if (selectedTable === id) setSelectedTable(null);
    setOrders((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setModal(null);
    notify("🗑️ Table delete hua!");
  };

  const handleAddMenu = () => {
    if (!form.name.trim() || !form.price) { notify("⚠️ Naam aur price daalein!"); return; }
    setMenuItems((prev) => [...prev, { id: Date.now(), name: form.name.trim(), price: parseFloat(form.price), cat: form.cat, emoji: form.emoji || "🍽️" }]);
    setModal(null);
    notify("✅ Menu item add hua!");
  };

  const handleSaveMenu = () => {
    setMenuItems((prev) => prev.map((m) => m.id === form.id ? { ...form, price: parseFloat(form.price) } : m));
    setModal(null);
    notify("✅ Menu update hua!");
  };

  const handleDeleteMenu = () => {
    setMenuItems((prev) => prev.filter((m) => m.id !== form.id));
    setModal(null);
    notify("🗑️ Menu item delete hua!");
  };

  const selectedTableObj = tables.find((t) => t.id === selectedTable);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">

        {/* Header */}
        <div className="bg-emerald-800 text-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <div>
              <p className="font-semibold text-sm">{selectedTableObj ? selectedTableObj.name : "Table select karein"}</p>
              {selectedTableObj && (
                <span className="text-xs text-emerald-300">{selectedTableObj.zone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 p-3 border-b border-gray-100">
          <button onClick={printKOT} className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">🖨️ Print KOT</button>
          <button onClick={saveBill} className="bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors">💾 Save Bill</button>
          <button onClick={settleBill} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors">✅ Settle Bill</button>
          <button onClick={printBill} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">🖨️ Print Bill</button>
        </div>

        {/* Menu Search */}
        <div className="px-3 pt-3 pb-2">
          <input
            type="text"
            placeholder="Menu search karein..."
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 bg-gray-50"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 px-3 pb-2 flex-wrap">
          {[["all", "All"], ["veg", "🌿 Veg"], ["nonveg", "🍗 Non-Veg"], ["drink", "🥤 Drinks"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setMenuCat(val)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${menuCat === val ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Menu List */}
        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1">
          {filteredMenu.map((m) => (
            <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
              <span className="text-base">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{m.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${CAT_BADGE[m.cat]}`}>{m.cat}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700">₹{m.price}</span>
              <button onClick={() => openEditMenu(m)} className="text-gray-300 hover:text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✎</button>
              <button onClick={() => addToOrder(m.id)} className="w-6 h-6 bg-emerald-700 text-white rounded-md text-sm flex items-center justify-center hover:bg-emerald-800 flex-shrink-0">+</button>
            </div>
          ))}
          {filteredMenu.length === 0 && <p className="text-center text-gray-400 text-xs py-6">Koi item nahi mila</p>}
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200">
          <div className="max-h-36 overflow-y-auto">
            {currentOrder.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-4">Koi order nahi</p>
            ) : (
              currentOrder.map((item) => (
                <div key={item.menuId} className="flex items-center gap-1.5 px-3 py-1.5 border-b border-gray-50 text-xs">
                  <span>{item.emoji}</span>
                  <span className="flex-1 text-gray-700 font-medium truncate">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => changeQty(item.menuId, -1)} className="w-5 h-5 border border-gray-200 rounded text-center hover:bg-gray-100 flex items-center justify-center">−</button>
                    <span className="w-5 text-center font-semibold">{item.qty}</span>
                    <button onClick={() => changeQty(item.menuId, 1)} className="w-5 h-5 border border-gray-200 rounded text-center hover:bg-gray-100 flex items-center justify-center">+</button>
                  </div>
                  <span className="text-emerald-700 font-semibold w-12 text-right">₹{item.price * item.qty}</span>
                  <button onClick={() => removeItem(item.menuId)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                </div>
              ))
            )}
          </div>

          {/* Bill Footer */}
          <div className="px-3 py-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Discount</span>
              <div className="flex items-center gap-1">
                <input
                  type="number" min="0" max="100" value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-12 text-xs border border-gray-200 rounded px-1.5 py-0.5 text-center outline-none focus:border-emerald-400"
                />
                <span>%</span>
                <span className="text-red-500">-₹{discAmt.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500"><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-bold text-gray-800 pt-1 border-t border-gray-100">
              <span>Total</span><span className="text-emerald-700">₹{total.toFixed(2)}</span>
            </div>
            <button onClick={settleBill} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm py-2.5 rounded-xl mt-1 transition-colors">
              PAY ₹{total.toFixed(2)} →
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <div className="bg-emerald-800 text-white px-5 py-3 flex items-center gap-3">
          <span className="text-lg">🍴</span>
          <span className="font-bold text-base tracking-wide">Restaurant POS</span>
          <div className="flex-1" />
          <button onClick={openAddMenu} className="text-xs border border-white/30 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">+ Menu Item</button>
          <button onClick={openAddTable} className="text-xs border border-white/30 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">+ Table</button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-4 gap-3 px-5 py-3 bg-white border-b border-gray-200">
          {[
            { label: "Total Tables", value: tables.length, color: "text-gray-800" },
            { label: "Occupied", value: occupiedCount, color: "text-red-600" },
            { label: "Free", value: tables.length - occupiedCount, color: "text-emerald-600" },
            { label: "Today Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, color: "text-emerald-700" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Zone Filter */}
        <div className="flex gap-2 px-5 py-3 bg-white border-b border-gray-100">
          {[["all", "🏠 All"], ["HALL", "🪑 Hall"], ["FAMILY", "👨‍👩‍👧 Family"], ["PARCEL", "📦 Parcel"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setZone(val)}
              className={`text-xs px-4 py-1.5 rounded-full border font-medium transition-colors ${zone === val ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
            {filteredTables.map((t) => {
              const ord = orders[t.id] || [];
              const tTotal = ord.reduce((s, i) => s + i.price * i.qty, 0);
              const isOcc = ord.length > 0;
              const isSel = selectedTable === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  className={`relative rounded-xl p-3 text-center cursor-pointer border-2 transition-all select-none
                    ${isOcc ? "bg-red-600 border-red-600 text-white hover:bg-red-700" : "bg-white border-gray-200 hover:border-emerald-400 text-gray-700"}
                    ${isSel ? "ring-2 ring-offset-1 ring-emerald-500 scale-105 shadow-lg" : "hover:scale-[1.02]"}
                  `}
                >
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${isOcc ? "text-red-100" : "text-gray-400"}`}>{t.zone}</span>
                  <p className="text-sm font-bold mt-0.5">{t.name}</p>
                  {isOcc
                    ? <p className="text-xs text-red-100 mt-1 font-semibold">₹{tTotal}</p>
                    : <p className="text-[10px] text-gray-300 mt-1">Free</p>
                  }
                  {isOcc && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full opacity-70" />}
                </div>
              );
            })}
          </div>
          {filteredTables.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <span className="text-3xl mb-2">🪑</span>
              <p className="text-sm">Is zone mein koi table nahi</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}

      {modal === "addTable" && (
        <Modal title="Naya Table Add Karein" onClose={() => setModal(null)}>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-emerald-500"
            placeholder="Table naam (e.g. Table 50)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-emerald-500 bg-white"
            value={form.zone}
            onChange={(e) => setForm({ ...form, zone: e.target.value })}
          >
            <option value="HALL">Hall</option>
            <option value="FAMILY">Family</option>
            <option value="PARCEL">Parcel</option>
          </select>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleAddTable} className="px-4 py-2 text-sm bg-emerald-700 text-white rounded-lg hover:bg-emerald-800">Add Table</button>
          </div>
        </Modal>
      )}

      {modal === "addMenu" && (
        <Modal title="Naya Menu Item Add Karein" onClose={() => setModal(null)}>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-emerald-500" placeholder="Item naam" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-emerald-500" type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-emerald-500" placeholder="Emoji (e.g. 🍛)" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-emerald-500 bg-white" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
            <option value="drink">Drink</option>
          </select>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleAddMenu} className="px-4 py-2 text-sm bg-emerald-700 text-white rounded-lg hover:bg-emerald-800">Add Item</button>
          </div>
        </Modal>
      )}

      {modal === "editMenu" && (
        <Modal title="Menu Item Edit Karein" onClose={() => setModal(null)}>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-emerald-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-emerald-500" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-emerald-500" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-emerald-500 bg-white" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
            <option value="drink">Drink</option>
          </select>
          <div className="flex items-center gap-2">
            <button onClick={handleDeleteMenu} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 mr-auto">Delete</button>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSaveMenu} className="px-4 py-2 text-sm bg-emerald-700 text-white rounded-lg hover:bg-emerald-800">Save</button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} />}
    </div>
  );
}