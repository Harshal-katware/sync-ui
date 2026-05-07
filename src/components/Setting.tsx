import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton.js";
import Navbar from "./Navbar.js";
import { getAllTables, addTable, deleteTable } from "../Api/tableApi";
import { getRestaurantInfo, saveRestaurantInfo } from "../Api/restaurantApi";
import { getAllTaxes, addTax, updateTax, deleteTax } from "../Api/taxApi";
import { getAllHours, saveAllHours } from "../Api/hoursApi";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  onDone?: () => void;
}

interface SectionProps {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

interface SaveBtnProps {
  onClick: () => void;
}

interface TaxEntry {
  id: number;
  name: string;
  rate: string;
  enabled: boolean;
}

interface HourEntry {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

// ✅ Updated to match friend's TableItem entity
interface TableEntry {
  id: number;
  name: string;
  zone: string;
}

interface OnSaveProps {
  onSave: (message: string) => void;
}

// ─── Reusable input styles ─────────────────────────────────────────────────────
const inp =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all";
const label =
  "block text-[10px] text-gray-400 uppercase tracking-[1.5px] mb-1.5 font-semibold";

// ─── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, onDone }: ToastProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
      style={{ animation: "toastUp .3s ease" }}
    >
      <span className="text-base">✓</span> {message}
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({ icon, title, subtitle, children }: SectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-lg shrink-0">
          {icon}
        </div>
        <div>
          <h2
            className="font-bold text-gray-800 text-[15px]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h2>
          <p className="text-[11px] text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Save Button ───────────────────────────────────────────────────────────────
function SaveBtn({ onClick }: SaveBtnProps) {
  return (
    <div className="flex justify-end mt-5">
      <button
        onClick={onClick}
        className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-sm"
      >
        Save Changes
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. RESTAURANT INFO
// ═══════════════════════════════════════════════════════════════════════════════
interface RestaurantForm {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  gst: string;
  fssai: string;
  website: string;
}

function RestaurantInfo({ onSave }: OnSaveProps) {
  const [form, setForm] = useState<RestaurantForm>({
    id: undefined,
    name: "",
    email: "",
    phone: "",
    address: "",
    gst: "",
    fssai: "",
    website: "",
  });

  useEffect(() => {
    getRestaurantInfo().then(setForm);
  }, []);

  const f =
    (key: keyof RestaurantForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value });

  return (
    <Section icon="🏪" title="Restaurant Info" subtitle="Basic details about your restaurant">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Restaurant Name</label>
          <input className={inp} value={form.name} onChange={f("name")} placeholder="Restaurant name" />
        </div>
        <div>
          <label className={label}>Email Address</label>
          <input className={inp} value={form.email} onChange={f("email")} placeholder="email@example.com" />
        </div>
        <div>
          <label className={label}>Phone Number</label>
          <input className={inp} value={form.phone} onChange={f("phone")} placeholder="+91 XXXXX XXXXX" />
        </div>
        <div>
          <label className={label}>Website</label>
          <input className={inp} value={form.website} onChange={f("website")} placeholder="www.example.com" />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Full Address</label>
          <textarea className={inp + " resize-none"} rows={2} value={form.address} onChange={f("address")} placeholder="Full restaurant address" />
        </div>
        <div>
          <label className={label}>GST Number</label>
          <input className={inp} value={form.gst} onChange={f("gst")} placeholder="GST registration number" />
        </div>
        <div>
          <label className={label}>FSSAI License</label>
          <input className={inp} value={form.fssai} onChange={f("fssai")} placeholder="FSSAI license number" />
        </div>
      </div>
      <SaveBtn onClick={async () => {
        await saveRestaurantInfo(form);
        onSave("Restaurant info saved!");
      }} />
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TAX / GST SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
function TaxSettings({ onSave }: OnSaveProps) {
  const [taxes, setTaxes] = useState<TaxEntry[]>([]);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [newTax, setNewTax] = useState<{ name: string; rate: string }>({ name: "", rate: "" });

  useEffect(() => {
    getAllTaxes().then(setTaxes);
  }, []);

  const toggle = async (id: number) => {
    const tax = taxes.find((t) => t.id === id);
    if (!tax) return;
    const updated = await updateTax(id, { ...tax, enabled: !tax.enabled });
    setTaxes((p) => p.map((t) => (t.id === id ? updated : t)));
  };

  const updateRate = async (id: number, rate: string) => {
    const tax = taxes.find((t) => t.id === id);
    if (!tax) return;
    const updated = await updateTax(id, { ...tax, rate });
    setTaxes((p) => p.map((t) => (t.id === id ? updated : t)));
  };

  const handleAddTax = async () => {
    if (!newTax.name || !newTax.rate) return;
    const added = await addTax({ name: newTax.name, rate: newTax.rate, enabled: true });
    setTaxes((p) => [...p, added]);
    setNewTax({ name: "", rate: "" });
    setShowAdd(false);
  };

  const removeTax = async (id: number) => {
    await deleteTax(id);
    setTaxes((p) => p.filter((t) => t.id !== id));
  };

  return (
    <Section icon="🧾" title="Tax / GST Settings" subtitle="Configure applicable taxes on bills">
      <div className="flex flex-col gap-3">
        {taxes.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50">
            <button
              onClick={() => toggle(t.id)}
              className={`relative rounded-full transition-colors shrink-0 ${t.enabled ? "bg-emerald-500" : "bg-gray-300"}`}
              style={{ width: 40, height: 22 }}
            >
              <span className="absolute top-0.5 bg-white rounded-full shadow transition-all"
                style={{ width: 18, height: 18, left: t.enabled ? 20 : 2 }} />
            </button>
            <span className={`flex-1 text-sm font-semibold ${t.enabled ? "text-gray-800" : "text-gray-400"}`}>
              {t.name}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="number" min="0" max="100" step="0.5"
                value={t.rate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRate(t.id, e.target.value)}
                className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <span className="text-xs text-gray-400 font-semibold">%</span>
            </div>
            <button onClick={() => removeTax(t.id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none shrink-0">✕</button>
          </div>
        ))}

        {showAdd ? (
          <div className="flex items-center gap-2 p-3.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50">
            <input
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Tax name" value={newTax.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTax({ ...newTax, name: e.target.value })}
            />
            <input
              type="number"
              className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="%" value={newTax.rate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTax({ ...newTax, rate: e.target.value })}
            />
            <button onClick={handleAddTax} className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition-all">Add</button>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors mt-1">
            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-base leading-none">+</span>
            Add Tax / Charge
          </button>
        )}
      </div>
      <SaveBtn onClick={() => onSave("Tax settings saved!")} />
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. OPERATING HOURS
// ═══════════════════════════════════════════════════════════════════════════════
function OperatingHours({ onSave }: OnSaveProps) {
  const [hours, setHours] = useState<HourEntry[]>([]);

  useEffect(() => {
    getAllHours().then(setHours);
  }, []);

  const update = (idx: number, key: keyof HourEntry, val: string | boolean) =>
    setHours((p) => p.map((h, i) => (i === idx ? { ...h, [key]: val } : h)));

  return (
    <Section icon="🕐" title="Operating Hours" subtitle="Set your restaurant's open and close times">
      <div className="flex flex-col gap-2">
        {hours.map((h, idx) => (
          <div
            key={h.day}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              h.closed ? "border-gray-100 bg-gray-50 opacity-60" : "border-gray-100 bg-white"
            }`}
          >
            <span className="w-24 text-sm font-semibold text-gray-700 shrink-0">{h.day}</span>
            <div className="flex items-center gap-2 flex-1">
              <input type="time" value={h.open} disabled={h.closed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(idx, "open", e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-gray-100 disabled:text-gray-400"
              />
              <span className="text-gray-400 text-xs font-semibold">to</span>
              <input type="time" value={h.close} disabled={h.closed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(idx, "close", e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
              <input type="checkbox" checked={h.closed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(idx, "closed", e.target.checked)}
                className="w-3.5 h-3.5 accent-red-500"
              />
              <span className="text-xs text-gray-400 font-medium">Closed</span>
            </label>
          </div>
        ))}
      </div>
      <SaveBtn onClick={async () => {
        await saveAllHours(hours);
        onSave("Operating hours saved!");
      }} />
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. TABLE MANAGEMENT — Updated to use friend's TableItem structure
// ═══════════════════════════════════════════════════════════════════════════════
const TABLE_ZONES: string[] = ["HALL", "FAMILY", "PARCEL"];

const zoneColor: Record<string, string> = {
  HALL:   "bg-green-50 text-green-600",
  FAMILY: "bg-yellow-50 text-yellow-600",
  PARCEL: "bg-blue-50 text-blue-600",
};

function TableManagement({ onSave }: OnSaveProps) {
  const [tables, setTables] = useState<TableEntry[]>([]);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [newTable, setNewTable] = useState<{ name: string; zone: string }>({
    name: "",
    zone: "HALL",
  });

  useEffect(() => {
    getAllTables().then(setTables);
  }, []);

  const removeTable = async (id: number) => {
    await deleteTable(id);
    setTables((p) => p.filter((t) => t.id !== id));
  };

  const handleAddTable = async () => {
    if (!newTable.name) return;
    const added = await addTable({
      name: newTable.name,
      zone: newTable.zone,
    });
    setTables((p) => [...p, added]);
    setNewTable({ name: "", zone: "HALL" });
    setShowAdd(false);
  };

  return (
    <Section icon="🪑" title="Table Management" subtitle="Add or remove dining tables">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tables.map((t) => (
          <div key={t.id} className="relative p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
            <button
              onClick={() => removeTable(t.id)}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors text-base leading-none"
            >
              ✕
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg shrink-0">
                🪑
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-base" style={{ fontFamily: "'Playfair Display',serif" }}>
                  {t.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${zoneColor[t.zone] ?? "bg-gray-100 text-gray-500"}`}>
                    {t.zone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {showAdd ? (
          <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 flex flex-col gap-2.5">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">New Table</p>
            <input
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Table name (e.g. T7)"
              value={newTable.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTable({ ...newTable, name: e.target.value })}
            />
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={newTable.zone}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewTable({ ...newTable, zone: e.target.value })}
            >
              {TABLE_ZONES.map((z) => <option key={z}>{z}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={handleAddTable} className="flex-1 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition-all">
                Add Table
              </button>
              <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-medium rounded-lg hover:bg-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-emerald-600 min-h-[120px]"
          >
            <span className="text-3xl">+</span>
            <span className="text-xs font-semibold">Add New Table</span>
          </button>
        )}
      </div>
      <SaveBtn onClick={() => onSave("Table settings saved!")} />
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
type SectionKey = "restaurant" | "tax" | "hours" | "tables";

interface SectionNav {
  key: SectionKey;
  label: string;
  icon: string;
}

const SECTIONS: SectionNav[] = [
  { key: "restaurant", label: "Restaurant Info", icon: "🏪" },
  { key: "tax",        label: "Tax / GST",        icon: "🧾" },
  { key: "hours",      label: "Operating Hours",  icon: "🕐" },
  { key: "tables",     label: "Table Management", icon: "🪑" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionKey>("restaurant");
  const [toast, setToast] = useState<string>("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes toastUp { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div>
        <Navbar variant="module" moduleName="Settings" />
      </div>

      <div className="flex h-[calc(100vh-76px)]">
        <aside className="w-56 shrink-0 bg-white border-r border-gray-100 shadow-sm hidden sm:flex flex-col pt-4 gap-1 px-2 sticky top-20 h-[calc(100vh-76px)]">
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-3 mb-2">Sections</p>
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full ${
                  activeSection === s.key ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-base">{s.icon}</span>
                {s.label}
                {activeSection === s.key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 px-2 py-4">
            <BackButton />
          </div>
        </aside>

        <div className="sm:hidden w-full fixed bottom-0 left-0 z-40 bg-white border-t border-gray-100 flex">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex-1 flex flex-col items-center py-2 text-[10px] font-semibold transition-colors ${
                activeSection === s.key ? "text-emerald-700" : "text-gray-400"
              }`}
            >
              <span className="text-lg">{s.icon}</span>
              {s.label.split(" ")[0]}
            </button>
          ))}
        </div>

        <main className="flex-1 px-4 sm:px-8 py-6 pb-24 sm:pb-6 overflow-y-auto h-full" style={{ animation: "fadeIn .3s ease" }}>
          <div className="max-w-3xl" key={activeSection} style={{ animation: "fadeIn .25s ease" }}>
            {activeSection === "restaurant" && <RestaurantInfo onSave={showToast} />}
            {activeSection === "tax"        && <TaxSettings    onSave={showToast} />}
            {activeSection === "hours"      && <OperatingHours onSave={showToast} />}
            {activeSection === "tables"     && <TableManagement onSave={showToast} />}
          </div>
        </main>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}