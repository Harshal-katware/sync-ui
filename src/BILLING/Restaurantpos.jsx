import { useState, useMemo } from "react";
import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";

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
  ...Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    name: `Table ${i + 1}`,
    zone: "HALL",
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    id: i + 12,
    name: `Table ${i + 12}`,
    zone: "FAMILY",
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: i + 31,
    name: `Bill ${i + 31}`,
    zone: "PARCEL",
  })),
];

function Toast({ msg }) {
  return (
    <div className="fixed top-3 right-3 z-50 bg-green-800 text-white text-sm px-4 py-2 rounded shadow-lg">
      {msg}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-72 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function RestaurantPOS() {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [menuItems, setMenuItems] = useState(MENU_ITEMS);
  const [orders, setOrders] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [zone, setZone] = useState("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [lastBill, setLastBill] = useState(0);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [nextTableId, setNextTableId] = useState(100);
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
    if (!selectedTable) {
      notify("⚠️ Pehle table select karein!");
      return;
    }
    const m = menuItems.find((x) => x.id === menuId);
    if (!m) return;
    const ord = [...currentOrder];
    const ex = ord.find((x) => x.menuId === menuId);
    if (ex) {
      ex.qty += 1;
      setCurrentOrder([...ord]);
    } else
      setCurrentOrder([
        ...ord,
        { menuId, name: m.name, price: m.price, qty: 1, emoji: m.emoji },
      ]);
    setMenuSearch("");
  };

  const changeQty = (menuId, d) => {
    const ord = currentOrder.map((x) =>
      x.menuId === menuId ? { ...x, qty: Math.max(1, x.qty + d) } : x,
    );
    setCurrentOrder(ord);
  };

  const removeItem = (menuId) =>
    setCurrentOrder(currentOrder.filter((x) => x.menuId !== menuId));

  const subtotal = currentOrder.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt = subtotal * (Math.min(100, Math.max(0, discount)) / 100);
  const afterDisc = subtotal - discAmt;
  const gst = afterDisc * 0.05;
  const total = afterDisc + gst;
  const totalItems = currentOrder.reduce((s, i) => s + i.qty, 0);

  const filteredMenu = useMemo(
    () =>
      menuItems.filter(
        (m) =>
          menuSearch && m.name.toLowerCase().includes(menuSearch.toLowerCase()),
      ),
    [menuItems, menuSearch],
  );

  const filteredTables = tables.filter(
    (t) => zone === "all" || t.zone === zone,
  );

  const settleBill = () => {
    if (!selectedTable) {
      notify("⚠️ Select the table");
      return;
    }
    if (!currentOrder.length) {
      notify("⚠️ Order is empty");
      return;
    }
    setLastBill(Math.round(total));
    setOrders((prev) => ({ ...prev, [selectedTable]: [] }));
    setDiscount(0);
    notify(`✅ ₹${total.toFixed(0)} Settled`);
  };

  const printKOT = () => {
    if (!selectedTable || !currentOrder.length) {
      notify("⚠️ Order is empty");
      return;
    }
    notify("🖨️ KOT has been sent!");
  };
  const saveKOT = () => {
    if (!selectedTable || !currentOrder.length) {
      notify("⚠️ Order is empty");
      return;
    }
    notify("💾 KOT  Saved");
  };
  const saveBill = () => {
    if (!selectedTable || !currentOrder.length) {
      notify("⚠️ Order is empty");
      return;
    }
    notify("💾 Bill Saved");
  };
  const printBill = () => {
    if (!selectedTable || !currentOrder.length) {
      notify("⚠️ Order is empty");
      return;
    }
    notify("🖨️ Bill has been Print");
  };

  const openAddTable = () => {
    setForm({ name: "", zone: "HALL" });
    setModal("addTable");
  };
  const openAddMenu = () => {
    setForm({ name: "", price: "", cat: "veg", emoji: "🍽️" });
    setModal("addMenu");
  };
  const openEditMenu = (item) => {
    setForm({ ...item });
    setModal("editMenu");
  };

  const handleAddTable = () => {
    if (!form.name.trim()) {
      notify("⚠️ Table naam daalein!");
      return;
    }
    const id = nextTableId;
    setNextTableId((n) => n + 1);
    setTables((prev) => [
      ...prev,
      { id, name: form.name.trim(), zone: form.zone },
    ]);
    setModal(null);
    notify("✅ Table added");
  };

  const handleDeleteTable = (id) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    if (selectedTable === id) setSelectedTable(null);
    setOrders((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setModal(null);
    notify("🗑️ Table deleted");
  };

  const handleAddMenu = () => {
    if (!form.name.trim() || !form.price) {
      notify("⚠️ Naam aur price daalein!");
      return;
    }
    setMenuItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.name.trim(),
        price: parseFloat(form.price),
        cat: form.cat,
        emoji: form.emoji || "🍽️",
      },
    ]);
    setModal(null);
    notify("✅ Item added to the menu");
  };

  const handleSaveMenu = () => {
    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === form.id ? { ...form, price: parseFloat(form.price) } : m,
      ),
    );
    setModal(null);
    notify("✅ Updated teh Menu");
  };

  const handleDeleteMenu = () => {
    setMenuItems((prev) => prev.filter((m) => m.id !== form.id));
    setModal(null);
    notify("🗑️ Menu item has been deleted");
  };

  const selectedTableObj = tables.find((t) => t.id === selectedTable);

  const ZONE_BTNS = [
    { val: "all", label: "All", cls: "bg-orange-600 text-white" },
    { val: "HALL", label: "HALL", cls: "bg-green-800 text-white" },
    { val: "FAMILY", label: "FAMILY", cls: "bg-yellow-700 text-white" },
    { val: "PARCEL", label: "PARCEL ORDER", cls: "bg-blue-800 text-white" },
  ];

  return (
    <>
      <div
        className="flex h-screen overflow-hidden"
        style={{
          fontFamily: "Arial, sans-serif",
          background: "#f0f0e8",
          fontSize: "13px",
        }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="flex flex-col border-r-2 border-gray-400"
          style={{ width: "50%", background: "#f0f0e8" }}
        >
          {/* Top Bar */}
          <div
            className="flex items-center gap-1.5 px-2 py-1.5"
            style={{ background: "#1a1a1a" }}
          >
            <button
              className="text-white px-2 py-1.5 rounded text-base"
              style={{ background: "#444" }}
            >
              ☰
            </button>
            <input
              value={selectedTableObj ? selectedTableObj.name : ""}
              readOnly
              placeholder="Table"
              className="rounded px-2 py-1 text-sm outline-none text-gray-800"
              style={{ width: "130px", height: "32px", background: "#fff" }}
            />
            <input
              placeholder="Captain"
              className="rounded px-2 py-1 text-sm outline-none text-gray-800"
              style={{ width: "130px", height: "32px", background: "#fff" }}
            />
            <div className="flex-1" />
            <button
              onClick={openAddMenu}
              className="text-white text-xs px-2 py-1 rounded"
              style={{ background: "#444" }}
            >
              + Menu
            </button>
            <button
              onClick={openAddTable}
              className="text-white text-xs px-2 py-1 rounded"
              style={{ background: "#e8a020" }}
            >
              + Table
            </button>
          </div>

          {/* Search */}
          <div
            className="flex gap-1.5 px-2 py-1.5"
            style={{ background: "#f0f0e8" }}
          >
            <input
              type="text"
              placeholder="Search by Code/Barcode/Name"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="flex-1 border border-gray-400 rounded px-2 py-1.5 text-sm outline-none"
              style={{ background: "#fff" }}
            />
            <button
              className="text-white px-3 rounded text-sm"
              style={{ background: "#cc2222" }}
            >
              🔍
            </button>
          </div>

          {/* Column Headers */}
          <div
            className="grid gap-1 px-2 pb-1"
            style={{ gridTemplateColumns: "1fr 100px 80px" }}
          >
            {["Item Name", "Qty  ·  Price", "Total"].map((h) => (
              <div
                key={h}
                className="border border-gray-400 rounded text-center py-1 text-xs text-gray-600"
                style={{ background: "#fff" }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Search Results or Order List */}
          <div className="flex-1 overflow-y-auto px-2 pb-1 space-y-0.5">
            {menuSearch ? (
              filteredMenu.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No items
                </div>
              ) : (
                filteredMenu.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => addToOrder(m.id)}
                    className="grid gap-1 cursor-pointer hover:bg-yellow-50 rounded border border-gray-200"
                    style={{ gridTemplateColumns: "1fr 100px 80px" }}
                  >
                    <div className="px-2 py-1.5 text-xs flex items-center gap-1 bg-white rounded-l">
                      <span>{m.emoji}</span>
                      <span className="font-medium">{m.name}</span>
                    </div>
                    <div className="px-2 py-1.5 text-xs text-center bg-white text-gray-600">
                      ₹{m.price}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-center bg-white rounded-r font-bold text-green-800">
                      +
                    </div>
                  </div>
                ))
              )
            ) : currentOrder.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                No orders, search for items
              </div>
            ) : (
              currentOrder.map((item) => (
                <div
                  key={item.menuId}
                  className="grid gap-1"
                  style={{ gridTemplateColumns: "1fr 100px 80px" }}
                >
                  <div
                    className="px-2 py-1.5 text-xs flex items-center gap-1 border border-gray-300 rounded-l"
                    style={{ background: "#fff" }}
                  >
                    <button
                      onClick={() => removeItem(item.menuId)}
                      className="text-red-600 font-bold text-sm leading-none"
                    >
                      ×
                    </button>
                    <span>{item.emoji}</span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div
                    className="flex items-center justify-center gap-1 border border-gray-300 text-xs"
                    style={{ background: "#fff" }}
                  >
                    <button
                      onClick={() => changeQty(item.menuId, -1)}
                      className="w-5 h-5 rounded text-white text-xs flex items-center justify-center"
                      style={{ background: "#555" }}
                    >
                      −
                    </button>
                    <span className="font-bold w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => changeQty(item.menuId, 1)}
                      className="w-5 h-5 rounded text-white text-xs flex items-center justify-center"
                      style={{ background: "#555" }}
                    >
                      +
                    </button>
                  </div>
                  <div
                    className="flex items-center justify-center border border-gray-300 rounded-r text-xs font-bold text-green-800"
                    style={{ background: "#fff" }}
                  >
                    ₹{item.price * item.qty}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Summary */}
          <div
            className="px-3 py-2 border-t-2 border-gray-400 space-y-1"
            style={{ background: "#f0f0e8" }}
          >
            <div className="flex justify-between text-xs text-gray-700">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-700">
              <span>Discount</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-10 text-xs border border-gray-400 rounded px-1 py-0.5 text-center outline-none"
                  style={{ background: "#fff" }}
                />
                <span>%</span>
                <span className="text-red-600">-₹{discAmt.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-700">
              <span>GST (5%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-400 pt-1">
              <span>Total</span>
              <span className="text-green-800">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Bar */}
          <div
            className="flex items-stretch"
            style={{ background: "#1a7a4a", minHeight: "44px" }}
          >
            <button
              className="text-white text-xs px-3 font-semibold border-r border-green-700 whitespace-nowrap"
              style={{ background: "#2255aa" }}
            >
              Last Bill ₹{lastBill.toFixed(2)}
            </button>
            <div className="flex-1 flex items-center justify-center text-white text-xs font-bold">
              ITEMS : {totalItems}
            </div>
            <button
              onClick={settleBill}
              className="text-white text-sm font-bold px-4 border-l border-green-700 hover:bg-green-700"
            >
              PAY ₹{total.toFixed(2)} →
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ background: "#f0f0e8" }}
        >
          {/* Action Buttons */}
          <div
            className="grid gap-1.5 p-2"
            style={{
              background: "#1a1a1a",
              gridTemplateColumns: "1fr 1fr 1fr",
            }}
          >
            <button
              onClick={printKOT}
              className="text-white text-sm font-bold py-2.5 rounded"
              style={{ background: "#2a2a2a" }}
            >
              🖨️ Print KOT
            </button>
            <button
              onClick={saveBill}
              className="text-white text-sm font-bold py-2.5 rounded"
              style={{ background: "#2a2a2a" }}
            >
              💾 Save Bill
            </button>
            <button
              onClick={printBill}
              className="text-white text-sm font-bold py-2.5 rounded"
              style={{ background: "#6633aa" }}
            >
              🖨️ Print Bill
            </button>
            <button
              onClick={saveKOT}
              className="text-white text-sm font-bold py-2.5 rounded"
              style={{ background: "#2a2a2a" }}
            >
              💾 Save KOT
            </button>
            <button
              onClick={settleBill}
              className="text-white text-sm font-bold py-2.5 rounded col-span-2"
              style={{ background: "#1a7a4a" }}
            >
              ✅ Settle Bill
            </button>
          </div>

          {/* Zone Filter */}
          <div
            className="flex gap-2 px-3 py-2 border-b-2 border-gray-400"
            style={{ background: "#f0f0e8" }}
          >
            {ZONE_BTNS.map(({ val, label, cls }) => (
              <button
                key={val}
                onClick={() => setZone(val)}
                className={`text-xs px-4 py-1.5 rounded font-bold transition-opacity ${zone === val ? cls : "bg-gray-300 text-gray-600"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tables Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              }}
            >
              {filteredTables.map((t) => {
                const ord = orders[t.id] || [];
                const tTotal = ord.reduce((s, i) => s + i.price * i.qty, 0);
                const isOcc = ord.length > 0;
                const isSel = selectedTable === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTable(t.id)}
                    className="rounded-md text-center cursor-pointer select-none transition-transform hover:scale-105"
                    style={{
                      border: isSel ? "3px solid #ffaa00" : "2px solid #bbb",
                      background: isOcc ? "#bb2222" : "#f5f5f0",
                      color: isOcc ? "#fff" : "#333",
                      padding: "8px 6px",
                      transform: isSel ? "scale(1.05)" : undefined,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        color: isOcc ? "#ffcccc" : "#888",
                        fontWeight: "bold",
                        letterSpacing: ".5px",
                      }}
                    >
                      {t.zone}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        margin: "2px 0",
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: isOcc ? "#ffcccc" : "#aaa",
                      }}
                    >
                      {isOcc ? `₹${tTotal}` : "Free"}
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredTables.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <span className="text-2xl mb-2">🪑</span>
                <p className="text-xs">No table available in this zone</p>
              </div>
            )}
            <div className="mt-56">
              <BackButton to="/dashboard" />
            </div>
          </div>
        </div>

        {/* ── MODALS ── */}
        {modal === "addTable" && (
          <Modal title="Add a new table" onClose={() => setModal(null)}>
            <input
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
              placeholder="Table naam"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-3 outline-none bg-white"
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value })}
            >
              <option value="HALL">Hall</option>
              <option value="FAMILY">Family</option>
              <option value="PARCEL">Parcel</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal(null)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTable}
                className="px-3 py-1.5 text-sm text-white rounded"
                style={{ background: "#1a7a4a" }}
              >
                Add
              </button>
            </div>
          </Modal>
        )}

        {modal === "addMenu" && (
          <Modal title="Naya Menu Item" onClose={() => setModal(null)}>
            <input
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
              placeholder="Item naam"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
              type="number"
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
              placeholder="Emoji"
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            />
            <select
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-3 outline-none bg-white"
              value={form.cat}
              onChange={(e) => setForm({ ...form, cat: e.target.value })}
            >
              <option value="veg">Veg</option>
              <option value="nonveg">Non-Veg</option>
              <option value="drink">Drink</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal(null)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMenu}
                className="px-3 py-1.5 text-sm text-white rounded"
                style={{ background: "#1a7a4a" }}
              >
                Add
              </button>
            </div>
          </Modal>
        )}

        {modal === "editMenu" && (
          <Modal title="Menu Item Edit" onClose={() => setModal(null)}>
            <input
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            />
            <select
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-3 outline-none bg-white"
              value={form.cat}
              onChange={(e) => setForm({ ...form, cat: e.target.value })}
            >
              <option value="veg">Veg</option>
              <option value="nonveg">Non-Veg</option>
              <option value="drink">Drink</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteMenu}
                className="px-3 py-1.5 text-sm text-white rounded mr-auto"
                style={{ background: "#cc2222" }}
              >
                Delete
              </button>
              <button
                onClick={() => setModal(null)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMenu}
                className="px-3 py-1.5 text-sm text-white rounded"
                style={{ background: "#1a7a4a" }}
              >
                Save
              </button>
            </div>
          </Modal>
        )}

        {toast && <Toast msg={toast} />}
      </div>
    </>
  );
}
