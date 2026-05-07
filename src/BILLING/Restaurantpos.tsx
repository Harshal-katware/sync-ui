import { useState, useMemo, useEffect, type JSX } from "react";
import axiosInstance from "../Api/axiosInstance";
import { useLang } from "../context/languageContext"; // ✅ Added

// ── KOT Print CSS ───────────────────────────────────────────────────────────
const KOT_PRINT_STYLE = `
  @media print {
    body * { visibility: hidden !important; }
    .kot-print-area, .kot-print-area * { visibility: visible !important; }
    .kot-print-area {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 80mm !important;
      font-family: monospace !important;
      font-size: 12px !important;
      padding: 8px !important;
      background: white !important;
      display: block !important;
    }
  }
`;

function injectPrintStyle(): void {
  if (document.getElementById("kot-print-style")) return;
  const tag = document.createElement("style");
  tag.id = "kot-print-style";
  tag.innerHTML = KOT_PRINT_STYLE;
  document.head.appendChild(tag);
}

// ── Types ────────────────────────────────────────────────────────────────────

type Category    = "veg" | "nonveg" | "drink";
type Zone        = "HALL" | "FAMILY" | "PARCEL";
type PaymentMode = "CASH" | "CARD" | "UPI" | "ONLINE";
type ModalType   = "addTable" | null;
type MobileView  = "left" | "right";

interface MenuItem {
  id:       number;
  name:     string;
  price:    number;
  category: Category;
  emoji:    string;
}
 
interface TableItem {
  id:   number;
  name: string;
  zone: Zone;
}
 
interface OrderItem {
  menuId:    number;
  name:      string;
  price:     number;
  qty:       number;
  emoji:     string;
  sentQty:   number;
}
 
interface OrderMap {
  [tableId: number]: OrderItem[];
}

interface TableOrderIdMap {
  [tableId: number]: number | null;
}

interface TableFormState {
  name: string;
  zone: Zone;
}

type FormState = TableFormState | Record<string, never>;

interface ZoneButton {
  val:   "all" | Zone;
  label: string;
  cls:   string;
}

const ZONE_BTNS: ZoneButton[] = [
  { val: "all",    label: "All",          cls: "bg-orange-600 text-white" },
  { val: "HALL",   label: "HALL",         cls: "bg-green-800 text-white"  },
  { val: "FAMILY", label: "FAMILY",       cls: "bg-yellow-700 text-white" },
  { val: "PARCEL", label: "PARCEL ORDER", cls: "bg-blue-800 text-white"   },
];

// ── Sub-Components ──────────────────────────────────────────────────────────

function Toast({ msg }: { msg: string }): JSX.Element {
  return (
    <div className="fixed bottom-16 right-4 z-50 text-white font-bold text-base px-6 py-4 rounded-xl shadow-2xl"
      style={{ background: "#1a1a2e", minWidth: "260px", textAlign: "center", border: "2px solid #444" }}>
      {msg}
    </div>
  );
}

function Spinner(): JSX.Element {
  return (
    <div className="flex items-center justify-center h-full py-10 text-gray-400 text-xs">
      <span className="animate-spin mr-2 text-lg">⏳</span> Loading...
    </div>
  );
}

function Modal({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode;
}): JSX.Element {
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

// ── Settle Bill Modal ───────────────────────────────────────────────────────

interface PrintBillModalProps {
  subtotal: number;
  gst:      number;
  total:    number;
  onClose:  () => void;
  onConfirm: (finalTotal: number, paymentMode: PaymentMode) => void;
}
 
function PrintBillModal({ subtotal, gst, total, onClose, onConfirm }: PrintBillModalProps): JSX.Element {
  const { t } = useLang(); // ✅
  const [paymentMode,      setPaymentMode]      = useState<PaymentMode>("CASH");
  const [discountAmt,      setDiscountAmt]      = useState<number>(0);
  const [discountPer,      setDiscountPer]      = useState<number>(0);
  const [billCharge,       setBillCharge]       = useState<number>(0);
  const [serviceChargePer, setServiceChargePer] = useState<number>(0);
  const [tenderCash,       setTenderCash]       = useState<number>(0);

  const serviceChargeAmt = (subtotal * serviceChargePer) / 100;
  const effectiveDisc    = discountAmt > 0 ? discountAmt : (subtotal * discountPer) / 100;
  const finalTotal       = total - effectiveDisc + serviceChargeAmt + billCharge;
  const returnCash       = Math.max(0, tenderCash - finalTotal);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden" style={{ fontFamily: "Arial, sans-serif" }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#1a1a2e" }}>
          <span className="text-white text-sm font-bold">✅ {t("bill.settleBill")}</span>
          <button onClick={onClose} className="text-white text-xl leading-none hover:text-red-400">×</button>
        </div>
 
        <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "82vh" }}>
          {/* Payment Mode */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">Payment Mode :</span>
            <div className="flex items-center border border-gray-400 rounded overflow-hidden flex-1">
              <span className="px-2 py-1.5 text-sm font-bold border-r border-gray-400" style={{ background: "#f5f5f5" }}>₹</span>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as PaymentMode)} className="flex-1 px-2 py-1.5 text-sm outline-none bg-white">
                <option>CASH</option><option>CARD</option><option>UPI</option><option>ONLINE</option>
              </select>
            </div>
          </div>

          {/* Discounts */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Discount Amt",         sym: "₹", val: discountAmt, set: (v: number) => { setDiscountAmt(v); setDiscountPer(0); }, reset: () => setDiscountAmt(0) },
              { label: "Discount Per",          sym: "%", val: discountPer, set: (v: number) => { setDiscountPer(v); setDiscountAmt(0); }, reset: () => setDiscountPer(0) },
              { label: "Per Bill Cash Charges", sym: "₹", val: billCharge,  set: (v: number) => setBillCharge(v),  reset: () => setBillCharge(0) },
            ].map(({ label, sym, val, set, reset }) => (
              <div key={label}>
                <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">{label}</p>
                <div className="flex items-center border border-gray-400 rounded overflow-hidden">
                  <span className="px-1 text-xs text-gray-500 border-r border-gray-300" style={{ background: "#f5f5f5" }}>{sym}</span>
                  <input type="number" min="0" value={val} onChange={(e) => set(parseFloat(e.target.value) || 0)} className="flex-1 px-1 py-1.5 text-xs outline-none text-center" style={{ background: "#fffff0" }} />
                  <button onClick={reset} className="px-1 text-gray-500 hover:text-blue-600 border-l border-gray-300 text-xs">↺</button>
                </div>
              </div>
            ))}
          </div>

          {/* Service Charge */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Service Charge Per</p>
              <div className="flex items-center border border-gray-400 rounded overflow-hidden">
                <span className="px-1 text-xs text-gray-500 border-r border-gray-300" style={{ background: "#f5f5f5" }}>%</span>
                <input type="number" min="0" max="100" value={serviceChargePer} onChange={(e) => setServiceChargePer(parseFloat(e.target.value) || 0)} className="flex-1 px-1 py-1.5 text-xs outline-none text-center" style={{ background: "#fffff0" }} />
                <button onClick={() => setServiceChargePer(0)} className="px-1 text-gray-500 hover:text-blue-600 border-l border-gray-300 text-xs">↺</button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Service Charge Amt</p>
              <div className="flex items-center border border-gray-400 rounded overflow-hidden">
                <span className="px-1 text-xs text-gray-500 border-r border-gray-300" style={{ background: "#f5f5f5" }}>₹</span>
                <input type="number" readOnly value={serviceChargeAmt.toFixed(2)} className="flex-1 px-1 py-1.5 text-xs outline-none text-center" style={{ background: "#fffff0" }} />
              </div>
            </div>
          </div>

          {/* Tender / Return */}
          <div className="grid grid-cols-2 gap-2 items-end">
            <div>
              <p className="text-[11px] text-gray-600 mb-1">Tender Cash</p>
              <div className="flex items-center border border-gray-400 rounded overflow-hidden">
                <span className="px-1 text-xs text-gray-500 border-r border-gray-300" style={{ background: "#f5f5f5" }}>₹</span>
                <input type="number" min="0" value={tenderCash} onChange={(e) => setTenderCash(parseFloat(e.target.value) || 0)} className="flex-1 px-1 py-1.5 text-xs outline-none text-center" style={{ background: "#fffff0" }} />
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
            <div className="flex justify-between text-xs text-gray-700"><span>Bill Amt.</span><span className="font-semibold">₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs text-gray-700"><span>{t("bill.discount")} Amt.</span><span>{effectiveDisc.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs text-gray-700"><span>Service Charge Amt.</span><span>{serviceChargeAmt.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs text-gray-700"><span>Tax Amount</span><span>₹ {gst.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-300 pt-1.5"><span>{t("bill.total")}</span><span>₹ {finalTotal.toFixed(2)}</span></div>
          </div>

          <button onClick={() => onConfirm(finalTotal, paymentMode)} className="w-full py-2.5 text-white font-bold text-sm rounded" style={{ background: "#1a7a4a" }}>
            ✅ Confirm & Settle  ₹{finalTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function RestaurantPOS(): JSX.Element {
  const { t } = useLang(); // ✅ Translation hook

  // ── State ─────────────────────────────────────────────────────────────────
  const [tables,        setTables]        = useState<TableItem[]>([]);
  const [menuItems,     setMenuItems]     = useState<MenuItem[]>([]);

  const [orders, setOrders] = useState<OrderMap>(() => {
    try {
      const saved = localStorage.getItem("pos_orders");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [tableOrderIds, setTableOrderIds] = useState<TableOrderIdMap>(() => {
    try {
      const saved = localStorage.getItem("pos_table_order_ids");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [zone,          setZone]          = useState<"all" | Zone>("all");
  const [menuSearch,    setMenuSearch]    = useState<string>("");
  const [discount,      setDiscount]      = useState<number>(0);
  const [lastBill,      setLastBill]      = useState<number>(0);
  const [modal,         setModal]         = useState<ModalType>(null);
  const [toast,         setToast]         = useState<string | null>(null);
  const [form,          setForm]          = useState<FormState>({});
  const [mobileView,    setMobileView]    = useState<MobileView>("left");
  const [showPrintBill, setShowPrintBill] = useState<boolean>(false);
  const [loadingMenu,   setLoadingMenu]   = useState<boolean>(true);
  const [loadingTables, setLoadingTables] = useState<boolean>(true);
  const [saving,        setSaving]        = useState<boolean>(false);

  const [kotItemsToPrint, setKotItemsToPrint] = useState<{ menuId: number; name: string; emoji: string; qty: number }[]>([]);
  const [kotTableInfo,    setKotTableInfo]    = useState<{ name: string; zone: string } | null>(null);

  useEffect(() => {
    injectPrintStyle();
    fetchMenuItems();
    fetchTables();
  }, []);

  useEffect(() => { localStorage.setItem("pos_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem("pos_table_order_ids", JSON.stringify(tableOrderIds)); }, [tableOrderIds]);

  const fetchMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const { data } = await axiosInstance.get<MenuItem[]>("/api/menu");
      setMenuItems(data);
    } catch (err: any) {
      console.error("❌ fetchMenuItems error:", err.response?.data ?? err.message);
      notify("❌ Failed to load menu!");
    } finally { setLoadingMenu(false); }
  };

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const { data } = await axiosInstance.get<TableItem[]>("/api/tables");
      setTables(data);
    } catch (err: any) {
      console.error("❌ fetchTables error:", err.response?.data ?? err.message);
      notify("❌ Failed to load tables!");
    } finally { setLoadingTables(false); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const notify = (msg: string): void => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };
 
  const currentOrder: OrderItem[] = selectedTable ? (orders[selectedTable] ?? []) : [];
 
  const setCurrentOrder = (arr: OrderItem[]): void => {
    if (!selectedTable) return;
    setOrders((prev) => ({ ...prev, [selectedTable]: arr }));
  };

  // ── Order Actions ─────────────────────────────────────────────────────────
  const addToOrder = (menuId: number): void => {
    if (!selectedTable) { notify("⚠️ Please select a table first!"); return; }
    const m = menuItems.find((x) => x.id === menuId);
    if (!m) return;
    const ord = [...currentOrder];
    const ex  = ord.find((x) => x.menuId === menuId);
    if (ex) { ex.qty += 1; setCurrentOrder([...ord]); }
    else { setCurrentOrder([...ord, { menuId, name: m.name, price: m.price, qty: 1, emoji: m.emoji, sentQty: 0 }]); }
    setMenuSearch("");
  };
 
  const setQty = (menuId: number, val: string): void => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) return;
    setCurrentOrder(currentOrder.map((x) => x.menuId === menuId ? { ...x, qty: parsed } : x));
  };
 
  const removeItem = (menuId: number): void => {
    setCurrentOrder(currentOrder.filter((x) => x.menuId !== menuId));
  };

  // ── Bill Calculations ─────────────────────────────────────────────────────
  const subtotal:   number = currentOrder.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt:    number = subtotal * (Math.min(100, Math.max(0, discount)) / 100);
  const afterDisc:  number = subtotal - discAmt;
  const gst:        number = afterDisc * 0.05;
  const total:      number = afterDisc + gst;
  const totalItems: number = currentOrder.reduce((s, i) => s + i.qty, 0);
  const unsentItems = currentOrder.filter((i) => i.qty > i.sentQty);

  // ── Filtered Lists ────────────────────────────────────────────────────────
  const filteredMenu: MenuItem[] = useMemo(
    () => menuItems.filter((m) => menuSearch && m.name.toLowerCase().includes(menuSearch.toLowerCase())),
    [menuItems, menuSearch]
  );
  const filteredTables: TableItem[] = tables.filter((t) => zone === "all" || t.zone === zone);

  // ── KOT Logic ─────────────────────────────────────────────────────────────
  const printKOT = async (): Promise<void> => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    const snapshot = [...currentOrder];
    const toSend   = snapshot.filter((i) => i.qty > i.sentQty);
    if (toSend.length === 0) { notify("⚠️ No new items to send to kitchen!"); return; }

    const kotItems = toSend.map((i) => ({
      menuId: i.menuId, name: i.name, emoji: i.emoji, price: i.price,
      qty: i.qty - i.sentQty,
    }));

    setSaving(true);
    try {
      const tableObj  = tables.find((t) => t.id === selectedTable);
      const tableName = tableObj?.name ?? "";
      let orderId     = tableOrderIds[selectedTable] ?? null;

      if (!orderId) {
        const orderPayload = {
          tableId: selectedTable, tableName, items: kotItems,
          subtotal: kotItems.reduce((s, i) => s + i.price * i.qty, 0),
          discount: 0, gst: 0, serviceCharge: 0, billCharge: 0,
          total: kotItems.reduce((s, i) => s + i.price * i.qty, 0),
        };
        const { data: order } = await axiosInstance.post("/api/orders", orderPayload);
        orderId = order.id;
        setTableOrderIds((prev) => ({ ...prev, [selectedTable!]: orderId }));
      } else {
        await axiosInstance.post(`/api/orders/${orderId}/kot`, { items: kotItems });
      }

      setKotItemsToPrint(kotItems);
      setKotTableInfo({ name: tableObj?.name ?? "", zone: tableObj?.zone ?? "" });

      setOrders((prev) => ({
        ...prev,
        [selectedTable!]: snapshot.map((i) => ({ ...i, sentQty: i.qty })),
      }));

      notify(`🖨️ KOT Sent! (${kotItems.length} item${kotItems.length > 1 ? "s" : ""})`);

      setTimeout(() => {
        window.print();
        setTimeout(() => setKotItemsToPrint([]), 1000);
      }, 400);
    } catch (err: any) {
      console.error("❌ printKOT ERROR:", err.response?.data);
      notify("❌ Failed to print KOT!");
    } finally { setSaving(false); }
  };

  // ── Settle / Print / Save Actions ─────────────────────────────────────────
  const settleBill = (): void => {
    if (!selectedTable)       { notify("⚠️ Please select a table!"); return; }
    if (!currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    setShowPrintBill(true);
  };

  const printBill = async (): Promise<void> => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    setSaving(true);
    try {
      const orderPayload = {
        tableId: selectedTable, tableName: tables.find((t) => t.id === selectedTable)?.name ?? "",
        items: currentOrder.map((i) => ({ menuId: i.menuId, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })),
        subtotal, discount: discAmt, gst, serviceCharge: 0, billCharge: 0, total,
      };
      await axiosInstance.post("/api/orders", orderPayload);
      notify("🖨️ Bill sent to printer!");
      window.print();
    } catch (err: any) {
      console.error("❌ printBill ERROR:", err.response?.data);
      notify("❌ Failed to print bill!");
    } finally { setSaving(false); }
  };

  const handlePrintBillConfirm = async (finalTotal: number, paymentMode: PaymentMode): Promise<void> => {
    setShowPrintBill(false);
    setSaving(true);
    try {
      const existingOrderId = tableOrderIds[selectedTable!] ?? null;
      let orderId = existingOrderId;

      if (!orderId) {
        const orderPayload = {
          tableId: selectedTable, tableName: tables.find((t) => t.id === selectedTable)?.name ?? "",
          items: currentOrder.map((i) => ({ menuId: i.menuId, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })),
          subtotal, discount: discAmt, gst, serviceCharge: 0, billCharge: 0, total: finalTotal,
        };
        const { data: order } = await axiosInstance.post("/api/orders", orderPayload);
        orderId = order.id;
      } else {
        await axiosInstance.put(`/api/orders/${orderId}`, {
          subtotal, discount: discAmt, gst, serviceCharge: 0, billCharge: 0, total: finalTotal,
        });
      }

      await axiosInstance.put(`/api/orders/${orderId}/settle`, { paymentMode });
      setLastBill(Math.round(finalTotal));
      if (selectedTable) {
        setOrders((prev) => ({ ...prev, [selectedTable!]: [] }));
        setTableOrderIds((prev) => ({ ...prev, [selectedTable!]: null }));
      }
      setDiscount(0);
      notify(`✅ ₹${finalTotal.toFixed(0)} Settled via ${paymentMode}`);
    } catch (err: any) {
      console.error("❌ settle ERROR:", err.response?.data);
      notify("❌ Failed to settle bill!");
    } finally { setSaving(false); }
  };

  const saveKOT = async (): Promise<void> => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    setSaving(true);
    try {
      let orderId = tableOrderIds[selectedTable] ?? null;
      if (!orderId) {
        const orderPayload = {
          tableId: selectedTable, tableName: tables.find((t) => t.id === selectedTable)?.name ?? "",
          items: currentOrder.map((i) => ({ menuId: i.menuId, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })),
          subtotal, discount: discAmt, gst, serviceCharge: 0, billCharge: 0, total,
        };
        const { data: order } = await axiosInstance.post("/api/orders", orderPayload);
        orderId = order.id;
        setTableOrderIds((prev) => ({ ...prev, [selectedTable!]: orderId }));
      }
      await axiosInstance.put(`/api/orders/${orderId}/save`);
      notify("💾 KOT Saved!");
    } catch (err: any) {
      console.error("❌ saveKOT ERROR:", err.response?.data);
      notify("❌ Failed to save KOT!");
    } finally { setSaving(false); }
  };

  const saveBill = async (): Promise<void> => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    setSaving(true);
    try {
      const orderPayload = {
        tableId: selectedTable, tableName: tables.find((t) => t.id === selectedTable)?.name ?? "",
        items: currentOrder.map((i) => ({ menuId: i.menuId, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })),
        subtotal, discount: discAmt, gst, serviceCharge: 0, billCharge: 0, total,
      };
      const { data: order } = await axiosInstance.post("/api/orders", orderPayload);
      await axiosInstance.put(`/api/orders/${order.id}/save`);
      notify("💾 Bill Saved!");
    } catch (err: any) {
      console.error("❌ saveBill ERROR:", err.response?.data);
      notify("❌ Failed to save bill!");
    } finally { setSaving(false); }
  };

  // ── Table CRUD ────────────────────────────────────────────────────────────
  const openAddTable = (): void => { setForm({ name: "", zone: "HALL" }); setModal("addTable"); };
  const tableForm = form as TableFormState;

  const handleAddTable = async (): Promise<void> => {
    if (!tableForm.name?.trim()) { notify("⚠️ Please enter table name!"); return; }
    setSaving(true);
    try {
      const { data: newTable } = await axiosInstance.post<TableItem>("/api/tables", {
        name: tableForm.name.trim(), zone: tableForm.zone,
      });
      setTables((prev) => [...prev, newTable]);
      setModal(null);
      notify("✅ Table added!");
    } catch (err: any) {
      console.error("❌ handleAddTable ERROR:", err.response?.data ?? err.message);
      notify("❌ Failed to add table!");
    } finally { setSaving(false); }
  };

  const handleDeleteTable = async (id: number): Promise<void> => {
    setSaving(true);
    try {
      await axiosInstance.delete(`/api/tables/${id}`);
      setTables((prev) => prev.filter((t) => t.id !== id));
      if (selectedTable === id) setSelectedTable(null);
      setOrders((prev) => { const n = { ...prev }; delete n[id]; return n; });
      setTableOrderIds((prev) => { const n = { ...prev }; delete n[id]; return n; });
      notify("🗑️ Table deleted!");
    } catch (err: any) {
      console.error("❌ handleDeleteTable ERROR:", err.response?.data ?? err.message);
      notify("❌ Failed to delete table!");
    } finally { setSaving(false); }
  };

  const selectedTableObj = tables.find((t) => t.id === selectedTable);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden" style={{ fontFamily: "Arial, sans-serif", background: "#f0f0e8", fontSize: "13px" }}>
 
      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden border-b-2 border-gray-400" style={{ background: "#1a1a1a" }}>
        <button onClick={() => setMobileView("left")} className={`flex-1 py-2 text-xs font-bold transition-colors ${mobileView === "left" ? "bg-green-700 text-white" : "text-gray-400"}`}>🧾 Order</button>
        <button onClick={() => setMobileView("right")} className={`flex-1 py-2 text-xs font-bold transition-colors ${mobileView === "right" ? "bg-green-700 text-white" : "text-gray-400"}`}>🪑 Tables</button>
      </div>

      {/* ── LEFT PANEL ── */}
      <div className={`flex flex-col border-r-2 border-gray-400 ${mobileView === "left" ? "flex" : "hidden"} md:flex`} style={{ width: "100%", flex: "1 1 0", background: "#f0f0e8" }}>

        {/* Top Bar */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 flex-wrap" style={{ background: "#1a1a1a" }}>
          <button className="text-white px-2 py-1.5 rounded text-base" style={{ background: "#444" }}>☰</button>
          <input value={selectedTableObj?.name ?? ""} readOnly placeholder={t("bill.table")} className="rounded px-2 py-1 text-sm outline-none text-gray-800" style={{ width: "110px", height: "32px", background: "#fff" }} />
          <input placeholder={t("bill.captain")} className="rounded px-2 py-1 text-sm outline-none text-gray-800" style={{ width: "110px", height: "32px", background: "#fff" }} />
          <div className="flex-1" />
          <button onClick={openAddTable} className="text-white text-xs px-2 py-1 rounded" style={{ background: "#e8a020" }}>+ {t("bill.table")}</button>
        </div>

        {/* Search */}
        <div className="flex gap-1.5 px-2 py-1.5" style={{ background: "#f0f0e8" }}>
          <input type="text" placeholder={t("bill.search")} value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)}
            className="flex-1 border border-gray-400 rounded px-2 py-1.5 text-sm outline-none" style={{ background: "#fff" }} />
          <button className="text-white px-3 rounded text-sm" style={{ background: "#cc2222" }}>🔍</button>
        </div>

        {/* Column Headers */}
        <div className="grid gap-1 px-2 pb-1" style={{ gridTemplateColumns: "1fr 80px 70px" }}>
          {[t("bill.itemName"), t("bill.qtyPrice"), t("bill.total")].map((h) => (
            <div key={h} className="border border-gray-400 rounded text-center py-1 text-xs text-gray-600" style={{ background: "#fff" }}>{h}</div>
          ))}
        </div>

        {/* Order / Menu Search List */}
        <div className="flex-1 overflow-y-auto px-2 pb-1 space-y-0.5">
          {loadingMenu ? <Spinner /> : menuSearch ? (
            filteredMenu.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">No items found</div>
            ) : (
              filteredMenu.map((m) => (
                <div key={m.id} onClick={() => addToOrder(m.id)}
                  className="grid gap-1 cursor-pointer hover:bg-yellow-50 rounded border border-gray-200"
                  style={{ gridTemplateColumns: "1fr 80px 70px" }}>
                  <div className="px-2 py-1.5 text-xs flex items-center gap-1 bg-white rounded-l">
                    <span>{m.emoji}</span><span className="font-medium">{m.name}</span>
                  </div>
                  <div className="px-2 py-1.5 text-xs text-center bg-white text-gray-600">₹{m.price}</div>
                  <div className="px-2 py-1.5 text-xs text-center bg-white rounded-r font-bold text-green-800">+</div>
                </div>
              ))
            )
          ) : currentOrder.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">{t("bill.noOrder")}</div>
          ) : (
            currentOrder.map((item) => {
              const isNewItem = item.sentQty === 0;
              const hasExtra  = item.qty > item.sentQty && !isNewItem;
              return (
                <div key={item.menuId} className="grid gap-1" style={{ gridTemplateColumns: "1fr 80px 70px" }}>
                  <div className={`px-2 py-1.5 text-xs flex items-center gap-1 border rounded-l ${isNewItem ? "border-orange-400 bg-orange-50" : hasExtra ? "border-blue-300 bg-blue-50" : "border-gray-300 bg-white"}`}>
                    <button onClick={() => removeItem(item.menuId)} className="text-red-600 font-bold text-sm leading-none">×</button>
                    <span>{item.emoji}</span>
                    <span className="truncate">{item.name}</span>
                    {isNewItem && <span className="ml-auto text-[9px] bg-orange-500 text-white px-1 rounded font-bold">NEW</span>}
                    {hasExtra  && <span className="ml-auto text-[9px] bg-blue-500 text-white px-1 rounded font-bold">+{item.qty - item.sentQty}</span>}
                    {!isNewItem && !hasExtra && <span className="ml-auto text-[9px] bg-green-600 text-white px-1 rounded font-bold">✓KOT</span>}
                  </div>
                  <div className="flex items-center justify-center border border-gray-300 text-xs" style={{ background: "#fff" }}>
                    <input type="number" min="1" value={item.qty} onChange={(e) => setQty(item.menuId, e.target.value)}
                      className="w-full text-center text-xs font-bold outline-none border-none bg-transparent" style={{ height: "100%", padding: "2px" }} />
                  </div>
                  <div className="flex items-center justify-center border border-gray-300 rounded-r text-xs font-bold text-green-800" style={{ background: "#fff" }}>
                    ₹{item.price * item.qty}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bill Summary */}
        <div className="px-3 py-2 border-t-2 border-gray-400 space-y-1" style={{ background: "#f0f0e8" }}>
          <div className="flex justify-between text-xs text-gray-700"><span>{t("bill.subtotal")}</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex items-center justify-between text-xs text-gray-700">
            <span>{t("bill.discount")}</span>
            <div className="flex items-center gap-1">
              <input type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-10 text-xs border border-gray-400 rounded px-1 py-0.5 text-center outline-none" style={{ background: "#fff" }} />
              <span>%</span>
              <span className="text-red-600">-₹{discAmt.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-700"><span>{t("bill.gst")}</span><span>₹{gst.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-400 pt-1">
            <span>{t("bill.total")}</span><span className="text-green-800">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Pay Bar */}
        <div className="flex items-stretch" style={{ background: saving ? "#555" : "#1a7a4a", minHeight: "44px", transition: "background .2s" }}>
          <button className="text-white text-xs px-3 font-semibold border-r border-green-700 whitespace-nowrap" style={{ background: "#2255aa" }}>
            {t("bill.lastBill")} ₹{lastBill.toFixed(2)}
          </button>
          <div className="flex-1 flex items-center justify-center text-white text-xs font-bold">
            {saving ? `⏳ ${t("bill.loading")}` : `${t("bill.items")} : ${totalItems}`}
          </div>
          <button onClick={settleBill} disabled={saving} className="text-white text-sm font-bold px-4 border-l border-green-700 hover:bg-green-700 disabled:opacity-50">
            PAY ₹{total.toFixed(2)} →
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={`flex flex-col overflow-hidden ${mobileView === "right" ? "flex" : "hidden"} md:flex`} style={{ width: "100%", flex: "1 1 0", background: "#f0f0e8" }}>

        {/* Action Buttons */}
        <div className="grid gap-1.5 p-2" style={{ background: "#1a1a1a", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <button onClick={printKOT} disabled={saving} className="relative text-white text-sm font-bold py-2.5 rounded disabled:opacity-50" style={{ background: "#1a7a4a" }}>
            🖨️ {t("bill.printKot")}
            {unsentItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {unsentItems.length}
              </span>
            )}
          </button>
          <button onClick={saveBill}   disabled={saving} className="text-white text-sm font-bold py-2.5 rounded disabled:opacity-50" style={{ background: "#1a7a4a" }}>💾 {t("bill.saveBill")}</button>
          <button onClick={printBill}  disabled={saving} className="text-white text-sm font-bold py-2.5 rounded disabled:opacity-50" style={{ background: "#6633aa" }}>🖨️ {t("bill.printBill")}</button>
          <button onClick={saveKOT}    disabled={saving} className="text-white text-sm font-bold py-2.5 rounded disabled:opacity-50" style={{ background: "#1a7a4a" }}>💾 {t("bill.saveKot")}</button>
          <button onClick={settleBill} disabled={saving} className="text-white text-sm font-bold py-2.5 rounded col-span-2 disabled:opacity-50" style={{ background: "#1a7a4a" }}>✅ {t("bill.settleBill")}</button>
        </div>

        {/* Zone Filter */}
        <div className="flex gap-2 px-3 py-2 border-b-2 border-gray-400 flex-wrap" style={{ background: "#f0f0e8" }}>
          {ZONE_BTNS.map(({ val, label, cls }) => (
            <button key={val} onClick={() => setZone(val)}
              className={`text-xs px-4 py-1.5 rounded font-bold transition-opacity ${zone === val ? cls : "bg-gray-300 text-gray-600"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {loadingTables ? <Spinner /> : (
            <>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
                {filteredTables.map((tbl) => {
                  const ord    = orders[tbl.id] ?? [];
                  const tTotal = ord.reduce((s, i) => s + i.price * i.qty, 0);
                  const isOcc  = ord.length > 0;
                  const isSel  = selectedTable === tbl.id;
                  const hasUnsent = ord.some((i) => i.qty > i.sentQty);
                  return (
                    <div key={tbl.id}
                      onClick={() => { setSelectedTable(tbl.id); setMobileView("left"); }}
                      className="rounded-md text-center cursor-pointer select-none transition-transform hover:scale-105 relative"
                      style={{ border: isSel ? "3px solid #ffaa00" : "2px solid #bbb", background: isOcc ? "#bb2222" : "#f5f5f0", color: isOcc ? "#fff" : "#333", padding: "8px 6px", transform: isSel ? "scale(1.05)" : undefined }}>
                      {hasUnsent && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-400 border border-white" />}
                      <div style={{ fontSize: "9px", color: isOcc ? "#ffcccc" : "#888", fontWeight: "bold", letterSpacing: ".5px" }}>{tbl.zone}</div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", margin: "2px 0" }}>{tbl.name}</div>
                      <div style={{ fontSize: "10px", color: isOcc ? "#ffcccc" : "#aaa" }}>{isOcc ? `₹${tTotal}` : t("bill.free")}</div>
                      <button onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`"${tbl.name}" delete karna chahte ho?`)) { handleDeleteTable(tbl.id); }
                        }}
                        className="mt-1 text-[9px] text-red-300 hover:text-red-500">🗑️</button>
                    </div>
                  );
                })}
              </div>
              {filteredTables.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <span className="text-2xl mb-2">🪑</span>
                  <p className="text-xs">{t("bill.noTables")}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal === "addTable" && (
        <Modal title={t("bill.addTable")} onClose={() => setModal(null)}>
          <input className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 outline-none" placeholder={t("bill.tableName")}
            value={tableForm.name ?? ""} onChange={(e) => setForm({ ...tableForm, name: e.target.value })} />
          <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-3 outline-none bg-white"
            value={tableForm.zone ?? "HALL"} onChange={(e) => setForm({ ...tableForm, zone: e.target.value as Zone })}>
            <option value="HALL">{t("bill.hall")}</option>
            <option value="FAMILY">{t("bill.family")}</option>
            <option value="PARCEL">{t("bill.parcel")}</option>
          </select>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">{t("bill.cancel")}</button>
            <button onClick={handleAddTable} disabled={saving} className="px-3 py-1.5 text-sm text-white rounded disabled:opacity-50" style={{ background: "#1a7a4a" }}>
              {saving ? t("bill.adding") : t("bill.add")}
            </button>
          </div>
        </Modal>
      )}

      {showPrintBill && (
        <PrintBillModal subtotal={subtotal} gst={gst} total={total}
          onClose={() => setShowPrintBill(false)} onConfirm={handlePrintBillConfirm} />
      )}
 
      {toast && <Toast msg={toast} />}

      {/* KOT Print Area */}
      {kotItemsToPrint.length > 0 && (
        <div className="kot-print-area" style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px", borderBottom: "1px dashed #000", paddingBottom: "4px", marginBottom: "6px" }}>
            *** KOT ***
          </div>
          <div style={{ fontSize: "11px", marginBottom: "4px" }}>
            <b>{t("bill.table")}:</b> {kotTableInfo?.name ?? ""} &nbsp;|&nbsp; <b>Zone:</b> {kotTableInfo?.zone ?? ""}
          </div>
          <div style={{ fontSize: "10px", marginBottom: "8px", borderBottom: "1px dashed #000", paddingBottom: "4px" }}>
            {new Date().toLocaleString("en-IN")}
          </div>
          <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #000" }}>
                <th style={{ textAlign: "left", paddingBottom: "4px" }}>{t("bill.itemName")}</th>
                <th style={{ textAlign: "center", paddingBottom: "4px" }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {kotItemsToPrint.map((item) => (
                <tr key={item.menuId}>
                  <td style={{ paddingTop: "5px", fontSize: "13px" }}>{item.emoji} {item.name}</td>
                  <td style={{ textAlign: "center", paddingTop: "5px", fontWeight: "bold", fontSize: "15px" }}>{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: "center", marginTop: "12px", fontSize: "11px", borderTop: "1px dashed #000", paddingTop: "6px" }}>
            ** KOT **
          </div>
        </div>
      )}
    </div>
  );
}