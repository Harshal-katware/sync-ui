import { useState, useMemo, useEffect, useRef, type JSX } from "react";
import axiosInstance from "../Api/axiosInstance";
import { getAllCaptains, type Captain } from "../Api/captainApi";
import { useLang, type Language } from "../context/languageContext";
import BackButton from "../components/BackButton";

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
      padding: 4px !important;
      background: white !important;
    }
    @page {
      size: 80mm auto;
      margin: 0mm;
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
  menuId:  number;
  name:    string;
  price:   number;
  qty:     number;
  emoji:   string;
  sentQty: number;
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
}

const ZONE_BTNS: ZoneButton[] = [
  { val: "all",    label: "All"          },
  { val: "HALL",   label: "Hall"         },
  { val: "FAMILY", label: "Family"       },
  { val: "PARCEL", label: "Parcel Order" },
];

function Toast({ msg }: { msg: string }): JSX.Element {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #0d1117, #0d6e5f)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        minWidth: "240px",
        textAlign: "center",
      }}
    >
      {msg}
    </div>
  );
}

function Spinner(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
      <div
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid #e2e8f0",
          borderTop: "3px solid #0d9488",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }): JSX.Element {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(13,17,23,0.6)", backdropFilter: "blur(4px)" }}>
      <div
        className="rounded-2xl p-6 w-80"
        style={{
          background: "#fff",
          boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800" style={{ fontSize: "15px" }}>{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            style={{ fontSize: "18px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface PrintBillModalProps {
  subtotal:  number;
  total:     number;
  onClose:   () => void;
  onConfirm: (finalTotal: number, paymentMode: PaymentMode) => void;
}

function PrintBillModal({ subtotal, total, onClose, onConfirm }: PrintBillModalProps): JSX.Element {
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

  const inputCls = "flex-1 px-2 py-1.5 text-xs outline-none text-center bg-white";
  const symCls   = "px-2 text-xs text-gray-400 border-r border-gray-200 bg-gray-50";
  const resetCls = "px-1.5 text-gray-400 hover:text-[#0d9488] border-l border-gray-200 text-xs transition-colors";
  const fieldBox = "flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-3" style={{ background: "rgba(13,17,23,0.55)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: "linear-gradient(to right, #0d1117, #0d6e5f)" }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="text-white font-bold text-sm">Settle Bill</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none transition-colors">×</button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "82vh" }}>
          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Payment Mode</label>
            <div className={fieldBox}>
              <span className={symCls}>₹</span>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="flex-1 px-3 py-2 text-sm outline-none bg-white text-gray-800"
              >
                <option>CASH</option><option>CARD</option><option>UPI</option><option>ONLINE</option>
              </select>
            </div>
          </div>

          {/* Discount & Charges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Discount Amt", sym: "₹", val: discountAmt, set: (v: number) => { setDiscountAmt(v); setDiscountPer(0); }, reset: () => setDiscountAmt(0) },
              { label: "Discount %",   sym: "%", val: discountPer, set: (v: number) => { setDiscountPer(v); setDiscountAmt(0); }, reset: () => setDiscountPer(0) },
              { label: "Bill Charges", sym: "₹", val: billCharge,  set: (v: number) => setBillCharge(v), reset: () => setBillCharge(0) },
            ].map(({ label, sym, val, set, reset }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                <div className={fieldBox}>
                  <span className={symCls}>{sym}</span>
                  <input type="number" min="0" value={val} onChange={(e) => set(parseFloat(e.target.value) || 0)} className={inputCls} />
                  <button onClick={reset} className={resetCls}>↺</button>
                </div>
              </div>
            ))}
          </div>

          {/* Service Charge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Service Charge %</p>
              <div className={fieldBox}>
                <span className={symCls}>%</span>
                <input type="number" min="0" max="100" value={serviceChargePer} onChange={(e) => setServiceChargePer(parseFloat(e.target.value) || 0)} className={inputCls} />
                <button onClick={() => setServiceChargePer(0)} className={resetCls}>↺</button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Service Charge Amt</p>
              <div className={fieldBox}>
                <span className={symCls}>₹</span>
                <input type="number" readOnly value={serviceChargeAmt.toFixed(2)} className={inputCls} style={{ background: "#f8fafc" }} />
              </div>
            </div>
          </div>

          {/* Tender & Return */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tender Cash</p>
              <div className={fieldBox}>
                <span className={symCls}>₹</span>
                <input type="number" min="0" value={tenderCash} onChange={(e) => setTenderCash(parseFloat(e.target.value) || 0)} className={inputCls} />
                <button onClick={() => setTenderCash(0)} className={resetCls}>↺</button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Return Cash</p>
              <p className="text-xl font-bold text-gray-900">₹ {returnCash.toFixed(2)}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="flex justify-between text-sm text-gray-600"><span>Bill Amount</span><span className="font-medium">₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-gray-600"><span>Discount</span><span className="text-red-500">-₹{effectiveDisc.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-gray-600"><span>Service Charge</span><span>₹{serviceChargeAmt.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200" style={{ fontSize: "16px" }}>
              <span>Final Total</span>
              <span style={{ color: "#059669" }}>₹ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => onConfirm(finalTotal, paymentMode)}
            className="w-full py-3 text-white font-bold text-sm rounded-xl transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(to right, #0d1117, #0d6e5f)" }}
          >
            ✅ Confirm & Settle  ₹{finalTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantPOS(): JSX.Element {
  const { t } = useLang();

  const [tables,        setTables]        = useState<TableItem[]>([]);
  const [menuItems,     setMenuItems]     = useState<MenuItem[]>([]);

  const [captains,            setCaptains]            = useState<Captain[]>([]);
  const [selectedCaptain,     setSelectedCaptain]     = useState<Captain | null>(null);
  const [captainSearch,       setCaptainSearch]       = useState<string>("");
  const [showCaptainDropdown, setShowCaptainDropdown] = useState<boolean>(false);
  const captainWrapRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<OrderMap>(() => {
    try { const s = localStorage.getItem("pos_orders"); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });

  const [tableOrderIds, setTableOrderIds] = useState<TableOrderIdMap>(() => {
    try { const s = localStorage.getItem("pos_table_order_ids"); return s ? JSON.parse(s) : {}; } catch { return {}; }
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

  const [kotItemsToPrint, setKotItemsToPrint] = useState<{ menuId: number; name: string; emoji: string; price: number; qty: number }[]>([]);
  const [kotTableInfo,    setKotTableInfo]    = useState<{ name: string; zone: string } | null>(null);
  const [shouldPrint,     setShouldPrint]     = useState(false);

  const [billItemsToPrint,       setBillItemsToPrint]       = useState<{ menuId: number; name: string; emoji: string; price: number; qty: number }[]>([]);
  const [billInfo,               setBillInfo]               = useState<{ tableName: string; subtotal: number; discount: number; total: number } | null>(null);
  const [shouldPrintBillReceipt, setShouldPrintBillReceipt] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (captainWrapRef.current && !captainWrapRef.current.contains(e.target as Node)) {
        setShowCaptainDropdown(false);
        if (selectedCaptain) setCaptainSearch(selectedCaptain.name);
        else setCaptainSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedCaptain]);

  useEffect(() => {
    if (selectedCaptain) setCaptainSearch(selectedCaptain.name);
    else setCaptainSearch("");
  }, [selectedCaptain]);

  useEffect(() => {
    injectPrintStyle();
    fetchMenuItems();
    fetchTables();
    getAllCaptains().then((all) => setCaptains(all.filter((c) => c.active)));
  }, []);

  useEffect(() => { localStorage.setItem("pos_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem("pos_table_order_ids", JSON.stringify(tableOrderIds)); }, [tableOrderIds]);

  useEffect(() => {
    if (shouldPrint && kotItemsToPrint.length > 0) {
      setShouldPrint(false);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.print();
        setTimeout(() => setKotItemsToPrint([]), 500);
      }));
    }
  }, [shouldPrint, kotItemsToPrint]);

  useEffect(() => {
    if (shouldPrintBillReceipt && billItemsToPrint.length > 0) {
      setShouldPrintBillReceipt(false);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.print();
        setTimeout(() => setBillItemsToPrint([]), 500);
      }));
    }
  }, [shouldPrintBillReceipt, billItemsToPrint]);

  const fetchMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const { data } = await axiosInstance.get<MenuItem[]>("/api/menu");
      setMenuItems(data);
    } catch (err: any) {
      console.error("❌ fetchMenuItems:", err.response?.data ?? err.message);
      notify("❌ Failed to load menu!");
    } finally { setLoadingMenu(false); }
  };

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const { data } = await axiosInstance.get<TableItem[]>("/api/tables");
      setTables(data);
    } catch (err: any) {
      console.error("❌ fetchTables:", err.response?.data ?? err.message);
      notify("❌ Failed to load tables!");
    } finally { setLoadingTables(false); }
  };

  const notify = (msg: string): void => { setToast(msg); setTimeout(() => setToast(null), 2400); };

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
    else { setCurrentOrder([...ord, { menuId, name: m.name, price: m.price, qty: 1, emoji: m.emoji, sentQty: 0 }]); }
    setMenuSearch("");
  };

  const setQty = (menuId: number, val: string): void => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) return;
    setCurrentOrder(currentOrder.map((x) => x.menuId === menuId ? { ...x, qty: parsed } : x));
  };

  const removeItem = (menuId: number): void => setCurrentOrder(currentOrder.filter((x) => x.menuId !== menuId));

  const subtotal:   number = currentOrder.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt:    number = subtotal * (Math.min(100, Math.max(0, discount)) / 100);
  const total:      number = subtotal - discAmt;
  const totalItems: number = currentOrder.reduce((s, i) => s + i.qty, 0);
  const unsentItems        = currentOrder.filter((i) => i.qty > i.sentQty);

  const filteredMenu: MenuItem[] = useMemo(
    () => menuItems.filter((m) => menuSearch && m.name.toLowerCase().includes(menuSearch.toLowerCase())),
    [menuItems, menuSearch]
  );

  const filteredCaptains: Captain[] = useMemo(
    () => captains.filter(
      (c) =>
        c.active &&
        (captainSearch === "" ||
          c.name.toLowerCase().includes(captainSearch.toLowerCase()) ||
          (c.phone ?? "").includes(captainSearch))
    ),
    [captains, captainSearch]
  );

  const filteredTables: TableItem[] = tables.filter((t) => zone === "all" || t.zone === zone);

  const ensureOrderId = async (tableId: number, orderItems: OrderItem[]): Promise<number> => {
    const existing = tableOrderIds[tableId] ?? null;
    if (existing) return existing;
    const tableObj = tables.find((t) => t.id === tableId);
    const sub      = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
    const disc     = sub * (Math.min(100, Math.max(0, discount)) / 100);
    const tot      = sub - disc;
    const payload = {
      tableId, tableName: tableObj?.name ?? "",
      captainName: selectedCaptain?.name ?? "",
      captainId:   selectedCaptain?.id ?? null,
      items: orderItems.map((i) => ({ menuId: i.menuId, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })),
      subtotal: sub, discount: disc, gst: 0, serviceCharge: 0, billCharge: 0, total: tot,
    };
    const { data: order } = await axiosInstance.post("/api/orders", payload);
    const newId = order.id as number;
    setTableOrderIds((prev) => ({ ...prev, [tableId]: newId }));
    return newId;
  };

  const printKOT = async (): Promise<void> => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    const snapshot = [...currentOrder];
    const toSend   = snapshot.filter((i) => i.qty > i.sentQty);
    if (toSend.length === 0) { notify("⚠️ No new items to send to kitchen!"); return; }
    const kotItems = toSend.map((i) => ({ menuId: i.menuId, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty - i.sentQty }));
    setSaving(true);
    try {
      const tableObj = tables.find((t) => t.id === selectedTable);
      let orderId    = tableOrderIds[selectedTable] ?? null;
      if (!orderId) {
        const sub = kotItems.reduce((s, i) => s + i.price * i.qty, 0);
        const payload = {
          tableId: selectedTable, tableName: tableObj?.name ?? "",
          captainName: selectedCaptain?.name ?? "",
          captainId:   selectedCaptain?.id ?? null,
          items: kotItems, subtotal: sub, discount: 0, gst: 0,
          serviceCharge: 0, billCharge: 0, total: sub,
        };
        const { data: order } = await axiosInstance.post("/api/orders", payload);
        orderId = order.id as number;
        setTableOrderIds((prev) => ({ ...prev, [selectedTable!]: orderId }));
      } else {
        try {
          await axiosInstance.post(`/api/orders/${orderId}/kot`, { items: kotItems });
        } catch (kotErr: any) {
          if (kotErr.response?.status === 404) {
            const sub = kotItems.reduce((s, i) => s + i.price * i.qty, 0);
            const payload = {
              tableId: selectedTable, tableName: tableObj?.name ?? "",
              captainName: selectedCaptain?.name ?? "",
              captainId:   selectedCaptain?.id ?? null,
              items: kotItems, subtotal: sub, discount: 0, gst: 0,
              serviceCharge: 0, billCharge: 0, total: sub,
            };
            const { data: order } = await axiosInstance.post("/api/orders", payload);
            orderId = order.id as number;
            setTableOrderIds((prev) => ({ ...prev, [selectedTable!]: orderId }));
          } else { throw kotErr; }
        }
      }
      setKotItemsToPrint(kotItems);
      setKotTableInfo({ name: tableObj?.name ?? "", zone: tableObj?.zone ?? "" });
      setOrders((prev) => ({ ...prev, [selectedTable!]: snapshot.map((i) => ({ ...i, sentQty: i.qty })) }));
      notify(`🖨️ KOT Sent! (${kotItems.length} item${kotItems.length > 1 ? "s" : ""})`);
      setShouldPrint(true);
    } catch (err: any) {
      console.error("❌ printKOT:", err.response?.data, err.response?.status);
      notify("❌ Failed to print KOT!");
    } finally { setSaving(false); }
  };

  const saveKOT = async (): Promise<void> => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    setSaving(true);
    try {
      const orderId = await ensureOrderId(selectedTable, currentOrder);
      await axiosInstance.put(`/api/orders/${orderId}/save`);
      notify("💾 KOT Saved!");
    } catch (err: any) {
      console.error("❌ saveKOT:", err.response?.data, err.response?.status);
      notify("❌ Failed to save KOT!");
    } finally { setSaving(false); }
  };

  const saveBill = async (): Promise<void> => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    setSaving(true);
    try {
      const orderId = await ensureOrderId(selectedTable, currentOrder);
      await axiosInstance.put(`/api/orders/${orderId}`, {
        subtotal, discount: discAmt, gst: 0, serviceCharge: 0, billCharge: 0, total,
        captainName: selectedCaptain?.name ?? "",
        captainId:   selectedCaptain?.id ?? null,
      });
      await axiosInstance.put(`/api/orders/${orderId}/save`);
      notify("💾 Bill Saved!");
    } catch (err: any) {
      console.error("❌ saveBill:", err.response?.data, err.response?.status);
      notify("❌ Failed to save bill!");
    } finally { setSaving(false); }
  };

  const printBill = async (): Promise<void> => {
    if (!selectedTable || !currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    setSaving(true);
    try {
      const tableObj = tables.find((t) => t.id === selectedTable);
      const orderId  = await ensureOrderId(selectedTable, currentOrder);
      await axiosInstance.put(`/api/orders/${orderId}`, {
        subtotal, discount: discAmt, gst: 0, serviceCharge: 0, billCharge: 0, total,
        captainName: selectedCaptain?.name ?? "",
        captainId:   selectedCaptain?.id ?? null,
      });
      setBillItemsToPrint(currentOrder.map((i) => ({ menuId: i.menuId, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })));
      setBillInfo({ tableName: tableObj?.name ?? "", subtotal, discount: discAmt, total });
      setShouldPrintBillReceipt(true);
      notify("🖨️ Bill sent to printer!");
    } catch (err: any) {
      console.error("❌ printBill:", err.response?.data, err.response?.status);
      notify("❌ Failed to print bill!");
    } finally { setSaving(false); }
  };

  const settleBill = (): void => {
    if (!selectedTable)       { notify("⚠️ Please select a table!"); return; }
    if (!currentOrder.length) { notify("⚠️ Order is empty!"); return; }
    setShowPrintBill(true);
  };

  const handlePrintBillConfirm = async (finalTotal: number, paymentMode: PaymentMode): Promise<void> => {
    setShowPrintBill(false);
    setSaving(true);
    try {
      const orderId = await ensureOrderId(selectedTable!, currentOrder);
      await axiosInstance.put(`/api/orders/${orderId}`, {
        subtotal, discount: discAmt, gst: 0, serviceCharge: 0, billCharge: 0, total: finalTotal,
        captainName: selectedCaptain?.name ?? "",
        captainId:   selectedCaptain?.id ?? null,
      });
      await axiosInstance.put(`/api/orders/${orderId}/settle`, { paymentMode });
      setLastBill(Math.round(finalTotal));
      setOrders((prev)        => ({ ...prev, [selectedTable!]: [] }));
      setTableOrderIds((prev) => ({ ...prev, [selectedTable!]: null }));
      setDiscount(0);
      setSelectedCaptain(null);
      notify(`✅ ₹${finalTotal.toFixed(0)} Settled via ${paymentMode}`);
    } catch (err: any) {
      console.error("❌ handlePrintBillConfirm:", err.response?.data, err.response?.status);
      notify("❌ Failed to settle bill!");
    } finally { setSaving(false); }
  };

  const openAddTable = (): void => { setForm({ name: "", zone: "HALL" }); setModal("addTable"); };
  const tableForm = form as TableFormState;

  const handleAddTable = async (): Promise<void> => {
    if (!tableForm.name?.trim()) { notify("⚠️ Please enter table name!"); return; }
    setSaving(true);
    try {
      const { data: newTable } = await axiosInstance.post<TableItem>("/api/tables", { name: tableForm.name.trim(), zone: tableForm.zone });
      setTables((prev) => [...prev, newTable]);
      setModal(null);
      notify("✅ Table added!");
    } catch (err: any) {
      console.error("❌ handleAddTable:", err.response?.data ?? err.message);
      notify("❌ Failed to add table!");
    } finally { setSaving(false); }
  };

  const handleDeleteTable = async (id: number): Promise<void> => {
    setSaving(true);
    try {
      await axiosInstance.delete(`/api/tables/${id}`);
      setTables((prev) => prev.filter((t) => t.id !== id));
      if (selectedTable === id) setSelectedTable(null);
      setOrders((prev)        => { const n = { ...prev }; delete n[id]; return n; });
      setTableOrderIds((prev) => { const n = { ...prev }; delete n[id]; return n; });
      notify("🗑️ Table deleted!");
    } catch (err: any) {
      console.error("❌ handleDeleteTable:", err.response?.data ?? err.message);
      notify("❌ Failed to delete table!");
    } finally { setSaving(false); }
  };

  const selectedTableObj = tables.find((t) => t.id === selectedTable);

  // Table status counts
  const freeTables    = tables.filter((t) => !(orders[t.id]?.length > 0)).length;
  const runningTables = tables.filter((t) =>  (orders[t.id]?.length > 0)).length;

  return (
    <div
      className="flex flex-col md:flex-row h-screen overflow-hidden"
      style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", background: "#f0f4f8", fontSize: "13px" }}
    >
      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden" style={{ background: "linear-gradient(to right, #0d1117, #0d6e5f)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <button
          onClick={() => setMobileView("left")}
          className="flex-1 py-3 text-xs font-semibold transition-colors"
          style={{ color: mobileView === "left" ? "#fff" : "#64748b", borderBottom: mobileView === "left" ? "2px solid #0d9488" : "2px solid transparent" }}
        >
          🧾 Order
        </button>
        <button
          onClick={() => setMobileView("right")}
          className="flex-1 py-3 text-xs font-semibold transition-colors"
          style={{ color: mobileView === "right" ? "#fff" : "#64748b", borderBottom: mobileView === "right" ? "2px solid #0d9488" : "2px solid transparent" }}
        >
          🪑 Tables
        </button>
      </div>

      {/* ── LEFT PANEL ── */}
      <div
        className={`flex flex-col ${mobileView === "left" ? "flex" : "hidden"} md:flex`}
        style={{ width: "100%", flex: "1 1 0", background: "#fff", borderRight: "1px solid #e2e8f0" }}
      >
        {/* Top Nav Bar — Menu Manager gradient */}
        <div
          className="flex items-center gap-2 px-4 py-3 flex-wrap"
          style={{ background: "linear-gradient(to right, #0d1117, #0d6e5f)", borderBottom: "1px solid rgba(255,255,255,0.08)", minHeight: "56px" }}
        >
          {/* Back Arrow */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center rounded-full transition-colors hover:bg-white/10 shrink-0"
            style={{ width: "32px", height: "32px" }}
            title="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Table display */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <span style={{ fontSize: "14px" }}>🪑</span>
            <span className="text-white text-sm font-medium" style={{ minWidth: "60px" }}>
              {selectedTableObj?.name ?? "No Table"}
            </span>
          </div>

          {/* Captain selector */}
          <div ref={captainWrapRef} className="relative" style={{ minWidth: "170px" }}>
            <div
              className="flex items-center rounded-lg overflow-hidden"
              style={{
                height: "34px",
                background: "rgba(255,255,255,0.08)",
                border: selectedCaptain ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div className="flex items-center justify-center shrink-0 px-2">
                {selectedCaptain ? (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "#d1fae5", color: "#065f46" }}
                  >
                    {selectedCaptain.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span style={{ fontSize: "14px" }}>👨‍🍳</span>
                )}
              </div>
              <input
                type="text"
                placeholder="Captain..."
                value={captainSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setCaptainSearch(val);
                  setSelectedCaptain(null);
                  setShowCaptainDropdown(val.length > 0);
                }}
                className="flex-1 text-xs outline-none bg-transparent"
                style={{ color: "#e2e8f0", minWidth: 0, padding: "0 4px" }}
              />
              {selectedCaptain && (
                <button
                  onClick={() => { setSelectedCaptain(null); setCaptainSearch(""); setShowCaptainDropdown(false); }}
                  className="shrink-0 px-2 text-xs transition-colors"
                  style={{ color: "#94a3b8" }}
                >
                  ✕
                </button>
              )}
            </div>

            {showCaptainDropdown && (
              <div
                className="absolute left-0 z-50 rounded-xl overflow-y-auto"
                style={{
                  top: "calc(100% + 6px)",
                  width: "210px",
                  maxHeight: "240px",
                  background: "#fff",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <button
                  onMouseDown={(e) => { e.preventDefault(); setSelectedCaptain(null); setCaptainSearch(""); setShowCaptainDropdown(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold shrink-0">—</div>
                  <span className="text-gray-400 font-medium">No Captain</span>
                  {!selectedCaptain && <span className="ml-auto text-[#059669] text-[10px] font-bold">✓</span>}
                </button>
                {filteredCaptains.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-[11px]">No captains found</div>
                )}
                {filteredCaptains.map((cap) => (
                  <button
                    key={cap.id}
                    onMouseDown={(e) => { e.preventDefault(); setSelectedCaptain(cap); setCaptainSearch(cap.name); setShowCaptainDropdown(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs border-b border-gray-50 hover:bg-emerald-50 transition-colors text-left"
                    style={{ background: selectedCaptain?.id === cap.id ? "#f0fdf4" : undefined }}
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold shrink-0">
                      {cap.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{cap.name}</p>
                      {cap.phone && <p className="text-[10px] text-gray-400">📞 {cap.phone}</p>}
                    </div>
                    {selectedCaptain?.id === cap.id && <span className="text-[#059669] text-[10px] font-bold shrink-0">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <button
            onClick={openAddTable}
            className="text-white text-xs px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            + Table
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2 px-4 py-3" style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
          <div className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: "1px solid #e2e8f0", background: "#f8fafc" }}>
            <span style={{ color: "#94a3b8", fontSize: "14px" }}>🔍</span>
            <input
              type="text"
              placeholder="Search by Code / Barcode / Name"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: "#374151" }}
            />
          </div>
        </div>

        {/* Table header */}
        <div className="grid px-4 py-2" style={{ gridTemplateColumns: "1fr 90px 75px", borderBottom: "1px solid #f1f5f9" }}>
          {["Item Name", "Qty · Price", "Total"].map((h) => (
            <div key={h} className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</div>
          ))}
        </div>

        {/* Order items */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {loadingMenu ? <Spinner /> : menuSearch ? (
            filteredMenu.length === 0 ? (
              <div className="text-center py-10" style={{ color: "#94a3b8", fontSize: "13px" }}>No items found</div>
            ) : (
              filteredMenu.map((m) => (
                <div
                  key={m.id}
                  onClick={() => addToOrder(m.id)}
                  className="grid gap-0 cursor-pointer rounded-lg overflow-hidden transition-all hover:shadow-md"
                  style={{ gridTemplateColumns: "1fr 90px 75px", border: "1px solid #e2e8f0" }}
                >
                  <div className="px-3 py-2.5 text-xs flex items-center gap-2" style={{ background: "#f8fafc" }}>
                    <span>{m.emoji}</span>
                    <span className="font-medium text-gray-700">{m.name}</span>
                  </div>
                  <div className="px-3 py-2.5 text-xs text-center flex items-center justify-center" style={{ background: "#fff", color: "#64748b" }}>₹{m.price}</div>
                  <div className="px-3 py-2.5 text-xs text-center flex items-center justify-center font-bold" style={{ background: "#f0fdf4", color: "#059669" }}>+</div>
                </div>
              ))
            )
          ) : currentOrder.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div style={{ fontSize: "40px", opacity: 0.25 }}>🧺</div>
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>No order · Search and add items</p>
            </div>
          ) : (
            currentOrder.map((item) => {
              const isNewItem = item.sentQty === 0;
              const hasExtra  = item.qty > item.sentQty && !isNewItem;
              return (
                <div
                  key={item.menuId}
                  className="grid rounded-lg overflow-hidden"
                  style={{
                    gridTemplateColumns: "1fr 90px 75px",
                    border: isNewItem ? "1px solid #fed7aa" : hasExtra ? "1px solid #99f6e4" : "1px solid #e2e8f0",
                  }}
                >
                  <div
                    className="px-3 py-2.5 text-xs flex items-center gap-1.5"
                    style={{ background: isNewItem ? "#fff7ed" : hasExtra ? "#f0fdfa" : "#fff" }}
                  >
                    <button onClick={() => removeItem(item.menuId)} className="text-red-400 hover:text-red-600 font-bold text-sm leading-none transition-colors">×</button>
                    <span>{item.emoji}</span>
                    <span className="truncate font-medium text-gray-700">{item.name}</span>
                    {isNewItem && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: "#f97316" }}>NEW</span>
                    )}
                    {hasExtra && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: "#0d9488" }}>+{item.qty - item.sentQty}</span>
                    )}
                    {!isNewItem && !hasExtra && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: "#059669" }}>✓KOT</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center" style={{ background: "#fff", borderLeft: "1px solid #e2e8f0" }}>
                    <input
                      type="number" min="1" value={item.qty}
                      onChange={(e) => setQty(item.menuId, e.target.value)}
                      className="w-full text-center text-xs font-bold outline-none border-none bg-transparent"
                      style={{ color: "#374151", padding: "4px" }}
                    />
                  </div>
                  <div className="flex items-center justify-center font-bold text-xs" style={{ background: "#f8fafc", color: "#059669", borderLeft: "1px solid #e2e8f0" }}>
                    ₹{item.price * item.qty}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bill Summary */}
        <div className="px-4 py-3 space-y-2.5" style={{ borderTop: "1px solid #e2e8f0", background: "#fff" }}>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Discount</span>
            <div className="flex items-center gap-2">
              <input
                type="number" min="0" max="100" value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-14 text-sm rounded-lg px-2 py-1 text-center outline-none"
                style={{ border: "1px solid #e2e8f0", background: "#f8fafc" }}
              />
              <span className="text-gray-400">%</span>
              <span className="font-medium" style={{ color: "#ef4444" }}>-₹{discAmt.toFixed(2)}</span>
            </div>
          </div>
          {selectedCaptain && (
            <div className="flex justify-between text-xs" style={{ color: "#64748b" }}>
              <span>👨‍🍳 Captain</span>
              <span className="font-semibold text-gray-700">{selectedCaptain.name}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2" style={{ borderTop: "1px solid #e2e8f0", fontSize: "16px" }}>
            <span className="text-gray-900">Total</span>
            <span style={{ color: "#059669" }}>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Bottom Action Bar — teal gradient */}
        <div
          className="flex items-stretch"
          style={{
            background: saving ? "#64748b" : "linear-gradient(to right, #0d1117, #0d6e5f)",
            minHeight: "52px",
            transition: "background 0.2s",
          }}
        >
          <button
            className="text-white text-xs px-4 font-semibold border-r whitespace-nowrap"
            style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)" }}
          >
            Last ₹{lastBill.toFixed(2)}
          </button>
          <div className="flex-1 flex items-center justify-center text-white text-sm font-semibold">
            {saving ? "⏳ Saving..." : `ITEMS: ${totalItems}`}
          </div>
          <button
            onClick={settleBill}
            disabled={saving}
            className="text-white font-bold px-5 border-l disabled:opacity-50 transition-colors hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.2)", fontSize: "14px" }}
          >
            PAY ₹{total.toFixed(2)} →
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className={`flex flex-col overflow-hidden ${mobileView === "right" ? "flex" : "hidden"} md:flex`}
        style={{ width: "100%", flex: "1 1 0", background: "#f0f4f8" }}
      >
        {/* Action Buttons — teal gradient header */}
        <div
          className="grid gap-2 p-3"
          style={{ background: "linear-gradient(to right, #0d1117, #0d6e5f)", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={printKOT}
            disabled={saving}
            className="relative text-white text-xs font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
            style={{ background: "#059669" }}
          >
            🖨️ Print KOT
            {unsentItems.length > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                style={{ background: "#ef4444" }}
              >
                {unsentItems.length}
              </span>
            )}
          </button>
          <button onClick={saveBill}  disabled={saving} className="text-white text-xs font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90" style={{ background: "#059669" }}>💾 Save Bill</button>
          <button onClick={printBill} disabled={saving} className="text-white text-xs font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90" style={{ background: "#7c3aed" }}>🖨️ Print Bill</button>
          <button onClick={saveKOT}   disabled={saving} className="text-white text-xs font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90" style={{ background: "#059669" }}>💾 Save KOT</button>
          <button onClick={settleBill} disabled={saving} className="text-white text-xs font-semibold py-2.5 rounded-lg col-span-2 disabled:opacity-50 transition-opacity hover:opacity-90" style={{ background: "#059669" }}>✅ Settle Bill</button>
        </div>

        {/* Status Summary Cards — match Menu Manager stat card style */}
        <div className="grid grid-cols-2 gap-3 px-4 py-3">
          <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm" style={{ borderLeft: "4px solid #059669" }}>
            <div>
              <p className="text-[9px] sm:text-[11px] font-medium uppercase tracking-[1.5px] mb-1" style={{ color: "#6b7280" }}>Free</p>
              <p className="text-2xl font-medium" style={{ color: "#111827" }}>{freeTables}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: "#dcfce7" }}>🪑</div>
          </div>
          <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm" style={{ borderLeft: "4px solid #dc2626" }}>
            <div>
              <p className="text-[9px] sm:text-[11px] font-medium uppercase tracking-[1.5px] mb-1" style={{ color: "#6b7280" }}>Running</p>
              <p className="text-2xl font-medium" style={{ color: "#111827" }}>{runningTables}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: "#ffedd5" }}>🍽️</div>
          </div>
        </div>

        {/* Zone Filter — match Menu Manager filter buttons */}
        <div className="flex gap-2 px-4 pb-3 flex-wrap">
          {ZONE_BTNS.map(({ val, label }) => {
            const active = zone === val;
            return (
              <button
                key={val}
                onClick={() => setZone(val)}
                className="text-xs px-4 py-1.5 rounded-lg font-semibold transition-all"
                style={{
                  background: active ? "#0d9488" : "#fff",
                  color:      active ? "#fff"    : "#374151",
                  border:     active ? "1px solid #0d9488" : "1px solid #d1d5db",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tables Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {loadingTables ? <Spinner /> : (
            <>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
                {filteredTables.map((t) => {
                  const ord       = orders[t.id] ?? [];
                  const tTotal    = ord.reduce((s, i) => s + i.price * i.qty, 0);
                  const isOcc     = ord.length > 0;
                  const isSel     = selectedTable === t.id;
                  const hasUnsent = ord.some((i) => i.qty > i.sentQty);

                  return (
                    <div
                      key={t.id}
                      onClick={() => { setSelectedTable(t.id); setMobileView("left"); }}
                      className="rounded-xl cursor-pointer select-none transition-all hover:shadow-md relative bg-white"
                      style={{
                        border: isSel
                          ? "2px solid #0d9488"
                          : isOcc
                          ? "1.5px solid #fca5a5"
                          : "1.5px solid #e5e7eb",
                        padding: "12px 10px",
                        boxShadow: isSel ? "0 0 0 3px rgba(13,148,136,0.15)" : isOcc ? "0 2px 8px rgba(239,68,68,0.1)" : "none",
                        transform: isSel ? "scale(1.03)" : undefined,
                      }}
                    >
                      {hasUnsent && (
                        <span
                          className="absolute top-2 right-2 w-2 h-2 rounded-full"
                          style={{ background: "#f97316", boxShadow: "0 0 0 2px #fff" }}
                        />
                      )}
                      <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#9ca3af" }}>{t.zone}</div>
                      <div className="font-bold mb-1" style={{ fontSize: "15px", color: "#111827" }}>{t.name}</div>
                      <div className="flex items-center gap-1 mb-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: isOcc ? "#ef4444" : "#22c55e" }}
                        />
                        <span className="text-[10px] font-medium" style={{ color: isOcc ? "#ef4444" : "#059669" }}>
                          {isOcc ? `₹${tTotal}` : "Free"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (window.confirm(`"${t.name}" delete karna chahte ho?`)) handleDeleteTable(t.id); }}
                        className="text-[10px] transition-colors"
                        style={{ color: "#cbd5e1" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
              {filteredTables.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 gap-2" style={{ color: "#9ca3af" }}>
                  <span style={{ fontSize: "28px" }}>🪑</span>
                  <p style={{ fontSize: "12px" }}>No tables in this zone</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal === "addTable" && (
        <Modal title="Add New Table" onClose={() => setModal(null)}>
          <input
            className="w-full rounded-lg px-3 py-2 text-sm mb-3 outline-none"
            style={{ border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151" }}
            placeholder="Table name"
            value={tableForm.name ?? ""}
            onChange={(e) => setForm({ ...tableForm, name: e.target.value })}
          />
          <select
            className="w-full rounded-lg px-3 py-2 text-sm mb-4 outline-none bg-white"
            style={{ border: "1px solid #e5e7eb", color: "#374151" }}
            value={tableForm.zone ?? "HALL"}
            onChange={(e) => setForm({ ...tableForm, zone: e.target.value as Zone })}
          >
            <option value="HALL">Hall</option>
            <option value="FAMILY">Family</option>
            <option value="PARCEL">Parcel</option>
          </select>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModal(null)}
              className="px-4 py-2 text-sm rounded-lg transition-colors hover:bg-gray-50"
              style={{ border: "1px solid #e5e7eb", color: "#374151" }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddTable}
              disabled={saving}
              className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(to right, #0d1117, #0d6e5f)" }}
            >
              {saving ? "Adding..." : "Add Table"}
            </button>
          </div>
        </Modal>
      )}

      {showPrintBill && (
        <PrintBillModal
          subtotal={subtotal}
          total={total}
          onClose={() => setShowPrintBill(false)}
          onConfirm={handlePrintBillConfirm}
        />
      )}

      {toast && <Toast msg={toast} />}

      {/* ── KOT Print Area ── */}
      {kotItemsToPrint.length > 0 && (
        <div className="kot-print-area" style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "18px", marginBottom: "2px", letterSpacing: "1px" }}>PATIL DHABHA</div>
          <div style={{ textAlign: "center", fontSize: "16px", fontWeight: "bold", borderBottom: "1px dashed #000", paddingBottom: "4px", marginBottom: "6px" }}>*** KOT ***</div>
          <div style={{ fontSize: "13px", marginBottom: "4px" }}>
            <b>Table:</b> {kotTableInfo?.name ?? ""} &nbsp;|&nbsp; <b>Zone:</b> {kotTableInfo?.zone ?? ""}
          </div>
          {selectedCaptain && (
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>
              <b>Captain:</b> {selectedCaptain.name}
            </div>
          )}
          <div style={{ fontSize: "12px", marginBottom: "8px", borderBottom: "1px dashed #000", paddingBottom: "4px" }}>
            {new Date().toLocaleString("en-IN")}
          </div>
          <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #000" }}>
                <th style={{ textAlign: "left", paddingBottom: "4px" }}>Item</th>
                <th style={{ textAlign: "center", paddingBottom: "4px" }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {kotItemsToPrint.map((item) => (
                <tr key={item.menuId}>
                  <td style={{ paddingTop: "5px", fontSize: "14px" }}>{item.emoji} {item.name}</td>
                  <td style={{ textAlign: "center", paddingTop: "5px", fontWeight: "bold", fontSize: "16px" }}>{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", borderTop: "1px dashed #000", paddingTop: "6px" }}>** KOT END **</div>
        </div>
      )}

      {/* ── Bill Receipt Print Area ── */}
      {billItemsToPrint.length > 0 && billInfo && (
        <div className="kot-print-area" style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "20px", letterSpacing: "1px", marginBottom: "2px" }}>PATIL DHABHA</div>
          <div style={{ textAlign: "center", fontSize: "11px", marginBottom: "2px" }}>Old PB Road NH-48, Opp. Aequs - Hattargi</div>
          <div style={{ textAlign: "center", fontSize: "11px", marginBottom: "6px", borderBottom: "1px dashed #000", paddingBottom: "6px" }}>📞 9000000000</div>
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px", borderBottom: "1px dashed #000", paddingBottom: "4px", marginBottom: "6px" }}>BILL RECEIPT</div>
          {selectedTableObj?.zone === "PARCEL" && (
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px", background: "#000", color: "#fff", padding: "4px", marginBottom: "6px", letterSpacing: "2px" }}>
              🛵 PICK UP
            </div>
          )}
          <div style={{ fontSize: "13px", marginBottom: "3px" }}><b>Table:</b> {billInfo.tableName}</div>
          {selectedCaptain && (
            <div style={{ fontSize: "13px", marginBottom: "3px" }}><b>Captain:</b> {selectedCaptain.name}</div>
          )}
          <div style={{ fontSize: "12px", marginBottom: "8px", borderBottom: "1px dashed #000", paddingBottom: "5px" }}>{new Date().toLocaleString("en-IN")}</div>
          <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #000" }}>
                <th style={{ textAlign: "left", paddingBottom: "5px" }}>Item</th>
                <th style={{ textAlign: "center", paddingBottom: "5px" }}>Qty</th>
                <th style={{ textAlign: "right", paddingBottom: "5px" }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {billItemsToPrint.map((item) => (
                <tr key={item.menuId}>
                  <td style={{ paddingTop: "5px" }}>{item.emoji} {item.name}</td>
                  <td style={{ textAlign: "center", paddingTop: "5px" }}>{item.qty}</td>
                  <td style={{ textAlign: "right", paddingTop: "5px" }}>₹{item.price * item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: "1px dashed #000", marginTop: "8px", paddingTop: "8px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Subtotal</span><span>₹{billInfo.subtotal.toFixed(2)}</span>
            </div>
            {billInfo.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Discount</span><span>-₹{billInfo.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "17px", marginTop: "6px", borderTop: "1px dashed #000", paddingTop: "6px" }}>
              <span>TOTAL</span><span>₹{billInfo.total.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "14px", fontSize: "13px" }}>Thank you! Visit Again 🙏</div>
        </div>
      )}
    </div>
  );
}