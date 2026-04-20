import { useState, useMemo, type JSX } from "react";
// import BackButton from "../components/BackButton";

// ── Types ──────────────────────────────────────────────────────────────────────

type Category = "veg" | "nonveg" | "drink";
type Zone = "HALL" | "FAMILY" | "PARCEL";
type PaymentMode = "CASH" | "CARD" | "UPI" | "ONLINE";
type ModalType = "addTable" | "addMenu" | "editMenu" | null;
type MobileView = "left" | "right";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  cat: Category;
  emoji: string;
}

interface TableItem {
  id: number;
  name: string;
  zone: Zone | "PARCEL";
}

interface OrderItem {
  menuId: number;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}

interface OrderMap {
  [tableId: number]: OrderItem[];
}

interface TableFormState {
  name: string;
  zone: Zone | "PARCEL";
}

interface MenuFormState {
  id?: number;
  name: string;
  price: string | number;
  cat: Category;
  emoji: string;
}

type FormState = TableFormState | MenuFormState | Record<string, never>;

interface ZoneButton {
  val: "all" | Zone;
  label: string;
  cls: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  { id: 1,  name: "Butter Milk",        price: 30,  cat: "drink",  emoji: "🥛" },
  { id: 2,  name: "Butter Kulcha",      price: 50,  cat: "veg",    emoji: "🫓" },
  { id: 3,  name: "Kaju Paneer Masala", price: 220, cat: "veg",    emoji: "🧆" },
  { id: 4,  name: "Dal Makhani",        price: 180, cat: "veg",    emoji: "🍲" },
  { id: 5,  name: "Chicken Tikka",      price: 280, cat: "nonveg", emoji: "🍗" },
  { id: 6,  name: "Mutton Curry",       price: 320, cat: "nonveg", emoji: "🍛" },
  { id: 7,  name: "Roti",               price: 15,  cat: "veg",    emoji: "🫓" },
  { id: 8,  name: "Naan",               price: 25,  cat: "veg",    emoji: "🫓" },
  { id: 9,  name: "Lassi",              price: 60,  cat: "drink",  emoji: "🥤" },
  { id: 10, name: "Cold Drink",         price: 40,  cat: "drink",  emoji: "🧃" },
  { id: 11, name: "Paneer Tikka",       price: 200, cat: "veg",    emoji: "🧀" },
  { id: 12, name: "Veg Biryani",        price: 160, cat: "veg",    emoji: "🍚" },
  { id: 13, name: "Chicken Biryani",    price: 240, cat: "nonveg", emoji: "🍚" },
  { id: 14, name: "Raita",              price: 40,  cat: "veg",    emoji: "🥣" },
  { id: 15, name: "Gulab Jamun",        price: 50,  cat: "veg",    emoji: "🍮" },
];

const INITIAL_TABLES: TableItem[] = [
  ...Array.from({ length: 11 }, (_, i): TableItem => ({ id: i + 1,  name: `Table ${i + 1}`,  zone: "HALL"   })),
  ...Array.from({ length: 5  }, (_, i): TableItem => ({ id: i + 12, name: `Table ${i + 12}`, zone: "FAMILY" })),
  ...Array.from({ length: 4  }, (_, i): TableItem => ({ id: i + 31, name: `Bill ${i + 31}`,  zone: "PARCEL" })),
];

const ZONE_BTNS: ZoneButton[] = [
  { val: "all",    label: "All",          cls: "bg-orange-600 text-white" },
  { val: "HALL",   label: "HALL",         cls: "bg-green-800 text-white"  },
  { val: "FAMILY", label: "FAMILY",       cls: "bg-yellow-700 text-white" },
  { val: "PARCEL", label: "PARCEL ORDER", cls: "bg-blue-800 text-white"   },
];

// ── Sub-Components ─────────────────────────────────────────────────────────────

interface ToastProps {
  msg: string;
}

function Toast({ msg }: ToastProps): JSX.Element {
  return (
    <div className="fixed top-3 right-3 z-50 bg-green-800 text-white text-sm px-4 py-2 rounded shadow-lg">
      {msg}
    </div>
  );
}

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps): JSX.Element {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-72 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Print Bill Modal ───────────────────────────────────────────────────────────

interface PrintBillModalProps {
  subtotal: number;
  gst: number;
  total: number;
  onClose: () => void;
  onConfirm: (finalTotal: number, paymentMode: PaymentMode) => void;
}

function PrintBillModal({ subtotal, gst, total, onClose, onConfirm }: PrintBillModalProps): JSX.Element {
  const [paymentMode,      setPaymentMode]      = useState<PaymentMode>("CASH");
  const [discountAmt,      setDiscountAmt]      = useState<number>(0);
  const [discountPer,      setDiscountPer]      = useState<number>(0);
  const [billCharge,       setBillCharge]       = useState<number>(0);
  const [serviceChargePer, setServiceChargePer] = useState<number>(0);
  const [tenderCash,       setTenderCash]       = useState<number>(0);

  const serviceChargeAmt: number = (subtotal * serviceChargePer) / 100;
  const effectiveDisc: number    = discountAmt > 0 ? discountAmt : (subtotal * discountPer) / 100;
  const finalTotal: number       = total - effectiveDisc + serviceChargeAmt + billCharge;
  const returnCash: number       = Math.max(0, tenderCash - finalTotal);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden" style={{ fontFamily: "Arial, sans-serif" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#1a1a2e" }}>
          <span className="text-white text-sm font-bold">🖨️ Print Bill</span>
          <button onClick={onClose} className="text-white text-xl leading-none hover:text-red-400">×</button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "82vh" }}>

          {/* Payment Mode */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">Payment Mode :</span>
            <div className="flex items-center border border-gray-400 rounded overflow-hidden flex-1">
              <span className="px-2 py-1.5 text-sm font-bold border-r border-gray-400" style={{ background: "#f5f5f5" }}>₹</span>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="flex-1 px-2 py-1.5 text-sm outline-none bg-white"
              >
                <option>CASH</option>
                <option>CARD</option>
                <option>UPI</option>
                <option>ONLINE</option>
              </select>
            </div>
          </div>

          {/* Discount Amt / Discount Per / Per Bill Cash Charge */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Discount Amt</p>
              <div className="flex items-center border border-gray-400 rounded overflow-hidden">
                <span className="px-1 text-xs text-gray-500 border-r border-gray-300" style={{ background: "#f5f5f5" }}>₹</span>
                <input
                  type="number" min="0" value={discountAmt}
                  onChange={(e) => { setDiscountAmt(parseFloat(e.target.value) || 0); setDiscountPer(0); }}
                  className="flex-1 px-1 py-1.5 text-xs outline-none text-center"
                  style={{ background: "#fffff0" }}
                />
                <button onClick={() => setDiscountAmt(0)} className="px-1 text-gray-500 hover:text-blue-600 border-l border-gray-300 text-xs">↺</button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Discount Per</p>
              <div className="flex items-center border border-gray-400 rounded overflow-hidden">
                <span className="px-1 text-xs text-gray-500 border-r border-gray-300" style={{ background: "#f5f5f5" }}>%</span>
                <input
                  type="number" min="0" max="100" value={discountPer}
                  onChange={(e) => { setDiscountPer(parseFloat(e.target.value) || 0); setDiscountAmt(0); }}
                  className="flex-1 px-1 py-1.5 text-xs outline-none text-center"
                  style={{ background: "#fffff0" }}
                />
                <button onClick={() => setDiscountPer(0)} className="px-1 text-gray-500 hover:text-blue-600 border-l border-gray-300 text-xs">↺</button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Per Bill Cash Charges</p>
              <div className="flex items-center border border-gray-400 rounded overflow-hidden">
                <span className="px-1 text-xs text-gray-500 border-r border-gray-300" style={{ background: "#f5f5f5" }}>₹</span>
                <input
                  type="number" min="0" value={billCharge}
                  onChange={(e) => setBillCharge(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-1 py-1.5 text-xs outline-none text-center"
                  style={{ background: "#fffff0" }}
                />
                <button onClick={() => setBillCharge(0)} className="px-1 text-gray-500 hover:text-blue-600 border-l border-gray-300 text-xs">↺</button>
              </div>
            </div>
          </div>

          {/* Service Charge Per / Service Charge Amt */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Service Charge Per</p>
              <div className="flex items-center border border-gray-400 rounded overflow-hidden">
                <span className="px-1 text-xs text-gray-500 border-r border-gray-300" style={{ background: "#f5f5f5" }}>%</span>
                <input
                  type="number" min="0" max="100" value={serviceChargePer}
                  onChange={(e) => setServiceChargePer(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-1 py-1.5 text-xs outline-none text-center"
                  style={{ background: "#fffff0" }}
                />
                <button onClick={() => setServiceChargePer(0)} className="px-1 text-gray-500 hover:text-blue-600 border-l border-gray-300 text-xs">↺</button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Service Charge Amt</p>
              <div className="flex items-center border border-gray-400 rounded overflow-hidden">
                <span className="px-1 text-xs text-gray-500 border-r border-gray-300" style={{ background: "#f5f5f5" }}>₹</span>
                <input
                  type="number" readOnly value={serviceChargeAmt.toFixed(2)}
                  className="flex-1 px-1 py-1.5 text-xs outline-none text-center"
                  style={{ background: "#fffff0" }}
                />
                <button onClick={() => setServiceChargePer(0)} className="px-1 text-gray-500 hover:text-blue-600 border-l border-gray-300 text-xs">↺</button>
              </div>
            </div>
          </div>

          {/* Tender Cash / Return Cash */}
          <div className="grid grid-cols-2 gap-2 items-end">
            <div>
              <p className="text-[11px] text-gray-600 mb-1">Tender Cash</p>
              <div className="flex items-center border border-gray-400 rounded overflow-hidden">
                <span className="px-1 text-xs text-gray-500 border-r border-gray-300" style={{ background: "#f5f5f5" }}>₹</span>
                <input
                  type="number" min="0" value={tenderCash}
                  onChange={(e) => setTenderCash(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-1 py-1.5 text-xs outline-none text-center"
                  style={{ background: "#fffff0" }}
                />
                <button onClick={() => setTenderCash(0)} className="px-1 text-gray-500 hover:text-blue-600 border-l border-gray-300 text-xs">↺</button>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-gray-600 mb-1">Return Cash</p>
              <p className="text-lg font-bold text-gray-800">₹ {returnCash.toFixed(2)}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-gray-300 pt-2 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-700">
              <span>Bill Amt.</span><span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-700">
              <span>Discount Amt.</span><span>{effectiveDisc.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-700">
              <span>SERVICE CHARGE AMT.</span><span>{serviceChargeAmt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-700">
              <span>Tax Amount</span><span>₹ {gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-300 pt-1.5">
              <span>Final Total</span><span>₹ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Confirm */}
          <button
            onClick={() => onConfirm(finalTotal, paymentMode)}
            className="w-full py-2.5 text-white font-bold text-sm rounded"
            style={{ background: "#1a7a4a" }}
          >
            ✅ Confirm & Settle  ₹{finalTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function RestaurantPOS(): JSX.Element {
  const [tables,        setTables]        = useState<TableItem[]>(INITIAL_TABLES);
  const [menuItems,     setMenuItems]     = useState<MenuItem[]>(MENU_ITEMS);
  const [orders,        setOrders]        = useState<OrderMap>({});
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [zone,          setZone]          = useState<"all" | Zone>("all");
  const [menuSearch,    setMenuSearch]    = useState<string>("");
  const [discount,      setDiscount]      = useState<number>(0);
  const [lastBill,      setLastBill]      = useState<number>(0);
  const [modal,         setModal]         = useState<ModalType>(null);
  const [toast,         setToast]         = useState<string | null>(null);
  const [nextTableId,   setNextTableId]   = useState<number>(100);
  const [form,          setForm]          = useState<FormState>({});
  const [mobileView,    setMobileView]    = useState<MobileView>("left");
  const [showPrintBill, setShowPrintBill] = useState<boolean>(false);

  const notify = (msg: string): void => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const currentOrder: OrderItem[] = selectedTable ? (orders[selectedTable] ?? []) : [];

  const setCurrentOrder = (arr: OrderItem[]): void => {
    if (!selectedTable) return;
    setOrders((prev) => ({ ...prev, [selectedTable]: arr }));
  };

  const addToOrder = (menuId: number): void => {
    if (!selectedTable) { notify("⚠️ Please select a table first!"); return; }
    const m = menuItems.find((x) => x.id === menuId);
    if (!m) return;
    const ord = [...currentOrder];
    const ex  = ord.find((x) => x.menuId === menuId);
    if (ex) { ex.qty += 1; setCurrentOrder([...ord]); }
    else setCurrentOrder([...ord, { menuId, name: m.name, price: m.price, qty: 1, emoji: m.emoji }]);
    setMenuSearch("");
  };

  const setQty = (menuId: number, val: string): void => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) return;
    const ord = currentOrder.map((x) => x.menuId === menuId ? { ...x, qty: parsed } : x);
    setCurrentOrder(ord);
  };

  const removeItem = (menuId: number): void => {
    setCurrentOrder(currentOrder.filter((x) => x.menuId !== menuId));
  };

  const subtotal:   number = currentOrder.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt:    number = subtotal * (Math.min(100, Math.max(0, discount)) / 100);
  const afterDisc:  number = subtotal - discAmt;
  const gst:        number = afterDisc * 0.05;
  const total:      number = afterDisc + gst;
  const totalItems: number = currentOrder.reduce((s, i) => s + i.qty, 0);

  const filteredMenu: MenuItem[] = useMemo(
    () => menuItems.filter((m) => menuSearch && m.name.toLowerCase().includes(menuSearch.toLowerCase())),
    [menuItems, menuSearch]
  );

  const filteredTables: TableItem[] = tables.filter((t) => zone === "all" || t.zone === zone);

  const settleBill = (): void => {
    if (!selectedTable)       { notify("⚠️ Please select a table!"); return; }
    if (!currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    setLastBill(Math.round(total));
    setOrders((prev) => ({ ...prev, [selectedTable]: [] }));
    setDiscount(0);
    notify(`✅ ₹${total.toFixed(0)} Settled successfully!`);
  };

  const handlePrintBillConfirm = (finalTotal: number, paymentMode: PaymentMode): void => {
    setShowPrintBill(false);
    setLastBill(Math.round(finalTotal));
    if (selectedTable) setOrders((prev) => ({ ...prev, [selectedTable]: [] }));
    setDiscount(0);
    notify(`🖨️ Bill Printed! ₹${finalTotal.toFixed(0)} via ${paymentMode}`);
  };

  const printKOT  = (): void => { if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; } notify("🖨️ KOT Printed!"); };
  const saveKOT   = (): void => { if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; } notify("💾 KOT Saved!"); };
  const saveBill  = (): void => { if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; } notify("💾 Bill Saved!"); };
  const printBill = (): void => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    setShowPrintBill(true);
  };

  const openAddTable = (): void => { setForm({ name: "", zone: "HALL" }); setModal("addTable"); };
  const openAddMenu  = (): void => { setForm({ name: "", price: "", cat: "veg", emoji: "🍽️" }); setModal("addMenu"); };

  const tableForm = form as TableFormState;
  const menuForm  = form as MenuFormState;

  const handleAddTable = (): void => {
    if (!tableForm.name?.trim()) { notify("⚠️ Please enter table name!"); return; }
    const id = nextTableId;
    setNextTableId((n) => n + 1);
    setTables((prev) => [...prev, { id, name: tableForm.name.trim(), zone: tableForm.zone }]);
    setModal(null);
    notify("✅ Table added!");
  };

  const handleDeleteTable = (id: number): void => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    if (selectedTable === id) setSelectedTable(null);
    setOrders((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setModal(null);
    notify("🗑️ Table deleted!");
  };

  const handleAddMenu = (): void => {
    if (!menuForm.name?.trim() || !menuForm.price) { notify("⚠️ Please enter name and price!"); return; }
    setMenuItems((prev) => [
      ...prev,
      { id: Date.now(), name: menuForm.name.trim(), price: parseFloat(String(menuForm.price)), cat: menuForm.cat, emoji: menuForm.emoji || "🍽️" },
    ]);
    setModal(null);
    notify("✅ Menu item added!");
  };

  const handleSaveMenu = (): void => {
    setMenuItems((prev) =>
      prev.map((m) => m.id === menuForm.id ? { ...menuForm, id: m.id, price: parseFloat(String(menuForm.price)) } : m)
    );
    setModal(null);
    notify("✅ Menu updated!");
  };

  const handleDeleteMenu = (): void => {
    setMenuItems((prev) => prev.filter((m) => m.id !== menuForm.id));
    setModal(null);
    notify("🗑️ Menu item deleted!");
  };

  const selectedTableObj: TableItem | undefined = tables.find((t) => t.id === selectedTable);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden" style={{ fontFamily: "Arial, sans-serif", background: "#f0f0e8", fontSize: "13px" }}>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden border-b-2 border-gray-400" style={{ background: "#1a1a1a" }}>
        <button
          onClick={() => setMobileView("left")}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${mobileView === "left" ? "bg-green-700 text-white" : "text-gray-400"}`}
        >
          🧾 Order
        </button>
        <button
          onClick={() => setMobileView("right")}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${mobileView === "right" ? "bg-green-700 text-white" : "text-gray-400"}`}
        >
          🪑 Tables
        </button>
      </div>

      {/* LEFT PANEL */}
      <div
        className={`flex flex-col border-r-2 border-gray-400 ${mobileView === "left" ? "flex" : "hidden"} md:flex`}
        style={{ width: "100%", flex: "1 1 0", background: "#f0f0e8" }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1.5 flex-wrap" style={{ background: "#1a1a1a" }}>
          <button className="text-white px-2 py-1.5 rounded text-base" style={{ background: "#444" }}>☰</button>
          <input
            value={selectedTableObj ? selectedTableObj.name : ""}
            readOnly
            placeholder="Table"
            className="rounded px-2 py-1 text-sm outline-none text-gray-800"
            style={{ width: "110px", height: "32px", background: "#fff" }}
          />
          <input
            placeholder="Captain"
            className="rounded px-2 py-1 text-sm outline-none text-gray-800"
            style={{ width: "110px", height: "32px", background: "#fff" }}
          />
          <div className="flex-1" />
          <button onClick={openAddMenu}  className="text-white text-xs px-2 py-1 rounded" style={{ background: "#444" }}>+ Menu</button>
          <button onClick={openAddTable} className="text-white text-xs px-2 py-1 rounded" style={{ background: "#e8a020" }}>+ Table</button>
        </div>

        <div className="flex gap-1.5 px-2 py-1.5" style={{ background: "#f0f0e8" }}>
          <input
            type="text"
            placeholder="Search by Code/Barcode/Name"
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            className="flex-1 border border-gray-400 rounded px-2 py-1.5 text-sm outline-none"
            style={{ background: "#fff" }}
          />
          <button className="text-white px-3 rounded text-sm" style={{ background: "#cc2222" }}>🔍</button>
        </div>

        <div className="grid gap-1 px-2 pb-1" style={{ gridTemplateColumns: "1fr 80px 70px" }}>
          {(["Item Name", "Qty · Price", "Total"] as const).map((h) => (
            <div key={h} className="border border-gray-400 rounded text-center py-1 text-xs text-gray-600" style={{ background: "#fff" }}>{h}</div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-1 space-y-0.5">
          {menuSearch ? (
            filteredMenu.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">No items found</div>
            ) : (
              filteredMenu.map((m) => (
                <div
                  key={m.id}
                  onClick={() => addToOrder(m.id)}
                  className="grid gap-1 cursor-pointer hover:bg-yellow-50 rounded border border-gray-200"
                  style={{ gridTemplateColumns: "1fr 80px 70px" }}
                >
                  <div className="px-2 py-1.5 text-xs flex items-center gap-1 bg-white rounded-l">
                    <span>{m.emoji}</span><span className="font-medium">{m.name}</span>
                  </div>
                  <div className="px-2 py-1.5 text-xs text-center bg-white text-gray-600">₹{m.price}</div>
                  <div className="px-2 py-1.5 text-xs text-center bg-white rounded-r font-bold text-green-800">+</div>
                </div>
              ))
            )
          ) : currentOrder.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">No order · Search and add items</div>
          ) : (
            currentOrder.map((item) => (
              <div key={item.menuId} className="grid gap-1" style={{ gridTemplateColumns: "1fr 80px 70px" }}>
                <div className="px-2 py-1.5 text-xs flex items-center gap-1 border border-gray-300 rounded-l" style={{ background: "#fff" }}>
                  <button onClick={() => removeItem(item.menuId)} className="text-red-600 font-bold text-sm leading-none">×</button>
                  <span>{item.emoji}</span>
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="flex items-center justify-center border border-gray-300 text-xs" style={{ background: "#fff" }}>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => setQty(item.menuId, e.target.value)}
                    className="w-full text-center text-xs font-bold outline-none border-none bg-transparent"
                    style={{ height: "100%", padding: "2px" }}
                  />
                </div>
                <div className="flex items-center justify-center border border-gray-300 rounded-r text-xs font-bold text-green-800" style={{ background: "#fff" }}>
                  ₹{item.price * item.qty}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-3 py-2 border-t-2 border-gray-400 space-y-1" style={{ background: "#f0f0e8" }}>
          <div className="flex justify-between text-xs text-gray-700"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex items-center justify-between text-xs text-gray-700">
            <span>Discount</span>
            <div className="flex items-center gap-1">
              <input
                type="number" min="0" max="100" value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-10 text-xs border border-gray-400 rounded px-1 py-0.5 text-center outline-none"
                style={{ background: "#fff" }}
              />
              <span>%</span>
              <span className="text-red-600">-₹{discAmt.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-700"><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-400 pt-1">
            <span>Total</span><span className="text-green-800">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-stretch" style={{ background: "#1a7a4a", minHeight: "44px" }}>
          <button className="text-white text-xs px-3 font-semibold border-r border-green-700 whitespace-nowrap" style={{ background: "#2255aa" }}>
            Last Bill ₹{lastBill.toFixed(2)}
          </button>
          <div className="flex-1 flex items-center justify-center text-white text-xs font-bold">
            ITEMS : {totalItems}
          </div>
          <button onClick={settleBill} className="text-white text-sm font-bold px-4 border-l border-green-700 hover:bg-green-700">
            PAY ₹{total.toFixed(2)} →
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className={`flex flex-col overflow-hidden ${mobileView === "right" ? "flex" : "hidden"} md:flex`}
        style={{ width: "100%", flex: "1 1 0", background: "#f0f0e8" }}
      >
        <div className="grid gap-1.5 p-2" style={{ background: "#1a1a1a", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <button onClick={printKOT}  className="text-white text-sm font-bold py-2.5 rounded" style={{ background: "#1a7a4a" }}>🖨️ Print KOT</button>
          <button onClick={saveBill}  className="text-white text-sm font-bold py-2.5 rounded" style={{ background: "#1a7a4a" }}>💾 Save Bill</button>
          <button onClick={printBill} className="text-white text-sm font-bold py-2.5 rounded" style={{ background: "#6633aa" }}>🖨️ Print Bill</button>
          <button onClick={saveKOT}   className="text-white text-sm font-bold py-2.5 rounded" style={{ background: "#1a7a4a" }}>💾 Save KOT</button>
          <button onClick={settleBill} className="text-white text-sm font-bold py-2.5 rounded col-span-2" style={{ background: "#1a7a4a" }}>✅ Settle Bill</button>
        </div>

        <div className="flex gap-2 px-3 py-2 border-b-2 border-gray-400 flex-wrap" style={{ background: "#f0f0e8" }}>
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

        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
            {filteredTables.map((t) => {
              const ord    = orders[t.id] ?? [];
              const tTotal = ord.reduce((s, i) => s + i.price * i.qty, 0);
              const isOcc  = ord.length > 0;
              const isSel  = selectedTable === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => { setSelectedTable(t.id); setMobileView("left"); }}
                  className="rounded-md text-center cursor-pointer select-none transition-transform hover:scale-105"
                  style={{
                    border: isSel ? "3px solid #ffaa00" : "2px solid #bbb",
                    background: isOcc ? "#bb2222" : "#f5f5f0",
                    color: isOcc ? "#fff" : "#333",
                    padding: "8px 6px",
                    transform: isSel ? "scale(1.05)" : undefined,
                  }}
                >
                  <div style={{ fontSize: "9px", color: isOcc ? "#ffcccc" : "#888", fontWeight: "bold", letterSpacing: ".5px" }}>{t.zone}</div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", margin: "2px 0" }}>{t.name}</div>
                  <div style={{ fontSize: "10px", color: isOcc ? "#ffcccc" : "#aaa" }}>{isOcc ? `₹${tTotal}` : "Free"}</div>
                </div>
              );
            })}
          </div>
          {filteredTables.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <span className="text-2xl mb-2">🪑</span>
              <p className="text-xs">No tables in this zone</p>
            </div>
          )}
          {/* <div className="mt-6"><BackButton to="/dashboard" /></div> */}
        </div>
      </div>

      {/* MODALS */}
      {modal === "addTable" && (
        <Modal title="Add New Table" onClose={() => setModal(null)}>
          <input
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
            placeholder="Table name"
            value={tableForm.name ?? ""}
            onChange={(e) => setForm({ ...tableForm, name: e.target.value })}
          />
          <select
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-3 outline-none bg-white"
            value={tableForm.zone ?? "HALL"}
            onChange={(e) => setForm({ ...tableForm, zone: e.target.value as Zone })}
          >
            <option value="HALL">Hall</option>
            <option value="FAMILY">Family</option>
            <option value="PARCEL">Parcel</option>
          </select>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button onClick={handleAddTable} className="px-3 py-1.5 text-sm text-white rounded" style={{ background: "#1a7a4a" }}>Add</button>
          </div>
        </Modal>
      )}

      {modal === "addMenu" && (
        <Modal title="Add New Menu Item" onClose={() => setModal(null)}>
          <input
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
            placeholder="Item name"
            value={menuForm.name ?? ""}
            onChange={(e) => setForm({ ...menuForm, name: e.target.value })}
          />
          <input
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
            type="number"
            placeholder="Price (₹)"
            value={menuForm.price ?? ""}
            onChange={(e) => setForm({ ...menuForm, price: e.target.value })}
          />
          <input
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
            placeholder="Emoji"
            value={menuForm.emoji ?? ""}
            onChange={(e) => setForm({ ...menuForm, emoji: e.target.value })}
          />
          <select
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-3 outline-none bg-white"
            value={menuForm.cat ?? "veg"}
            onChange={(e) => setForm({ ...menuForm, cat: e.target.value as Category })}
          >
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
            <option value="drink">Drink</option>
          </select>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button onClick={handleAddMenu} className="px-3 py-1.5 text-sm text-white rounded" style={{ background: "#1a7a4a" }}>Add</button>
          </div>
        </Modal>
      )}

      {modal === "editMenu" && (
        <Modal title="Edit Menu Item" onClose={() => setModal(null)}>
          <input
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
            value={menuForm.name ?? ""}
            onChange={(e) => setForm({ ...menuForm, name: e.target.value })}
          />
          <input
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
            type="number"
            value={menuForm.price ?? ""}
            onChange={(e) => setForm({ ...menuForm, price: e.target.value })}
          />
          <input
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none"
            value={menuForm.emoji ?? ""}
            onChange={(e) => setForm({ ...menuForm, emoji: e.target.value })}
          />
          <select
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-3 outline-none bg-white"
            value={menuForm.cat ?? "veg"}
            onChange={(e) => setForm({ ...menuForm, cat: e.target.value as Category })}
          >
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
            <option value="drink">Drink</option>
          </select>
          <div className="flex items-center gap-2">
            <button onClick={handleDeleteMenu} className="px-3 py-1.5 text-sm text-white rounded mr-auto" style={{ background: "#cc2222" }}>Delete</button>
            <button onClick={() => setModal(null)} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button onClick={handleSaveMenu} className="px-3 py-1.5 text-sm text-white rounded" style={{ background: "#1a7a4a" }}>Save</button>
          </div>
        </Modal>
      )}

      {/* PRINT BILL MODAL */}
      {showPrintBill && (
        <PrintBillModal
          subtotal={subtotal}
          gst={gst}
          total={total}
          onClose={() => setShowPrintBill(false)}
          onConfirm={handlePrintBillConfirm}
        />
      )}

      {toast && <Toast msg={toast} />}
    </div>
  );
}