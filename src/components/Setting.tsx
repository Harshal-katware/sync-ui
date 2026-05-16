import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import BackButton from "./BackButton.js";

import Navbar from "./Navbar.js";

import { getAllTables, addTable, deleteTable } from "../Api/tableApi";

import { getRestaurantInfo, saveRestaurantInfo } from "../Api/restaurantApi";

import { getAllTaxes, addTax, updateTax, deleteTax } from "../Api/taxApi";

import { getAllHours, saveAllHours } from "../Api/hoursApi";

import { useLang, type Language } from "../context/languageContext";

 

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ToastProps { message: string; }

interface SectionProps { icon: string; title: string; subtitle: string; children: React.ReactNode; }

interface SaveBtnProps { onClick: () => void; }

interface TaxEntry { id: number; name: string; rate: string; enabled: boolean; }

interface HourEntry { day: string; open: string; close: string; closed: boolean; }

interface TableEntry { id: number; name: string; zone: string; }

interface OnSaveProps { onSave: (message: string) => void; }
type SectionKey = "restaurant" | "tax" | "hours" | "tables" | "language";
interface SectionNav { key: SectionKey; label: string; icon: string; }

 

const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all";

const labelCls = "block text-[10px] text-gray-400 uppercase tracking-[1.5px] mb-1.5 font-semibold";

 

function Toast({ message }: ToastProps) {

  return (

    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2" style={{ animation: "toastUp .3s ease" }}>

      <span className="text-base">✓</span> {message}

    </div>

  );

}

 

function Section({ icon, title, subtitle, children }: SectionProps) {

  return (

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">

        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-lg shrink-0">{icon}</div>

        <div>

          <h2 className="font-bold text-gray-800 text-[15px]" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>

          <p className="text-[11px] text-gray-400">{subtitle}</p>

        </div>

      </div>

      <div className="px-6 py-5">{children}</div>

    </div>

  );

}

 

function SaveBtn({ onClick }: SaveBtnProps) {

  const { t } = useLang();

  return (

    <div className="flex justify-end mt-5">

      <button onClick={onClick} className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-sm">

        {t("settings.saveChanges")}

      </button>

    </div>

  );

}

 

// ═══════════════════════════════════════════════════════════════════════════════

// ✅ LANGUAGE SECTION — Hindi/English toggle

// ═══════════════════════════════════════════════════════════════════════════════

function LanguageSettings({ onSave }: OnSaveProps) {

  const { lang, setLang, t } = useLang();

 

  const languages: { code: Language; label: string; native: string; flag: string }[] = [

    { code: "en", label: "English", native: "English", flag: "🇬🇧" },

    { code: "hi", label: "Hindi",   native: "हिंदी",   flag: "🇮🇳" },

  ];

 

  return (

    <Section icon="🌐" title={t("settings.language")} subtitle={t("settings.languageSubtitle")}>

      <div className="flex flex-col gap-3">

        {languages.map((l) => (

          <button

            key={l.code}

            onClick={() => { setLang(l.code); onSave(`Language changed to ${l.label}!`); }}

            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${

              lang === l.code ? "border-emerald-500 bg-emerald-50" : "border-gray-100 bg-white hover:border-emerald-200 hover:bg-gray-50"

            }`}

          >

            <span className="text-2xl">{l.flag}</span>

            <div className="flex-1">

              <p className={`font-bold text-sm ${lang === l.code ? "text-emerald-700" : "text-gray-700"}`}>{l.native}</p>

              <p className="text-xs text-gray-400">{l.label}</p>

            </div>

            {lang === l.code && (

              <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">✓</span>

            )}

          </button>

        ))}

      </div>

    </Section>

  );

}

 

// ═══════════════════════════════════════════════════════════════════════════════

// 1. RESTAURANT INFO

// ═══════════════════════════════════════════════════════════════════════════════

interface RestaurantForm {

  id?: number; name: string; email: string; phone: string;

  address: string; gst: string; fssai: string; website: string;

}

 

function RestaurantInfo({ onSave }: OnSaveProps) {

  const { t } = useLang();

  const [form, setForm] = useState<RestaurantForm>({ id: undefined, name: "", email: "", phone: "", address: "", gst: "", fssai: "", website: "" });

  useEffect(() => { getRestaurantInfo().then(setForm); }, []);

  const f = (key: keyof RestaurantForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value });

 

  return (

    <Section icon="🏪" title={t("settings.restaurantInfo")} subtitle={t("settings.restaurantSubtitle")}>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div><label className={labelCls}>{t("settings.restaurantName")}</label><input className={inp} value={form.name ?? ""} onChange={f("name")} /></div>

        <div><label className={labelCls}>{t("settings.email")}</label><input className={inp} value={form.email ?? ""} onChange={f("email")} /></div>

        <div><label className={labelCls}>{t("settings.phone")}</label><input className={inp} value={form.phone ?? ""} onChange={f("phone")} /></div>

        <div><label className={labelCls}>{t("settings.website")}</label><input className={inp} value={form.website ?? ""} onChange={f("website")} /></div>

        <div className="sm:col-span-2"><label className={labelCls}>{t("settings.address")}</label><textarea className={inp + " resize-none"} rows={2} value={form.address ?? ""} onChange={f("address")} /></div>

        <div><label className={labelCls}>{t("settings.gst")}</label><input className={inp} value={form.gst ?? ""} onChange={f("gst")} /></div>

        <div><label className={labelCls}>{t("settings.fssai")}</label><input className={inp} value={form.fssai ?? ""} onChange={f("fssai")} /></div>

      </div>

      <SaveBtn onClick={async () => { await saveRestaurantInfo(form); onSave(t("settings.restaurantInfo") + " saved!"); }} />

    </Section>

  );

}

 

// ═══════════════════════════════════════════════════════════════════════════════

// 2. TAX / GST SETTINGS

// ═══════════════════════════════════════════════════════════════════════════════

function TaxSettings({ onSave }: OnSaveProps) {

  const { t } = useLang();

  const [taxes, setTaxes] = useState<TaxEntry[]>([]);

  const [showAdd, setShowAdd] = useState(false);

  const [newTax, setNewTax] = useState({ name: "", rate: "" });

 

  useEffect(() => { getAllTaxes().then(setTaxes); }, []);

 

  const toggle = async (id: number) => {

    const tax = taxes.find((tx) => tx.id === id); if (!tax) return;

    const updated = await updateTax(id, { ...tax, enabled: !tax.enabled });

    setTaxes((p) => p.map((tx) => (tx.id === id ? updated : tx)));

  };

  const updateRate = async (id: number, rate: string) => {

    const tax = taxes.find((tx) => tx.id === id); if (!tax) return;

    const updated = await updateTax(id, { ...tax, rate });

    setTaxes((p) => p.map((tx) => (tx.id === id ? updated : tx)));

  };

  const handleAddTax = async () => {

    if (!newTax.name || !newTax.rate) return;

    const added = await addTax({ name: newTax.name, rate: newTax.rate, enabled: true });

    setTaxes((p) => [...p, added]); setNewTax({ name: "", rate: "" }); setShowAdd(false);

  };

  const removeTax = async (id: number) => {

    await deleteTax(id); setTaxes((p) => p.filter((tx) => tx.id !== id));

  };

 

  return (

    <Section icon="🧾" title={t("settings.tax")} subtitle={t("settings.taxSubtitle")}>

      <div className="flex flex-col gap-3">

        {taxes.map((tx) => (

          <div key={tx.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50">

            <button onClick={() => toggle(tx.id)} className={`relative rounded-full transition-colors shrink-0 ${tx.enabled ? "bg-emerald-500" : "bg-gray-300"}`} style={{ width: 40, height: 22 }}>

              <span className="absolute top-0.5 bg-white rounded-full shadow transition-all" style={{ width: 18, height: 18, left: tx.enabled ? 20 : 2 }} />

            </button>

            <span className={`flex-1 text-sm font-semibold ${tx.enabled ? "text-gray-800" : "text-gray-400"}`}>{tx.name}</span>

            <div className="flex items-center gap-1.5 shrink-0">

              <input type="number" min="0" max="100" step="0.5" value={tx.rate} onChange={(e) => updateRate(tx.id, e.target.value)}

                className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />

              <span className="text-xs text-gray-400 font-semibold">%</span>

            </div>

            <button onClick={() => removeTax(tx.id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none shrink-0">✕</button>

          </div>

        ))}

        {showAdd ? (

          <div className="flex items-center gap-2 p-3.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50">

            <input className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"

              placeholder="Tax name" value={newTax.name} onChange={(e) => setNewTax({ ...newTax, name: e.target.value })} />

            <input type="number" className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"

              placeholder="%" value={newTax.rate} onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })} />

            <button onClick={handleAddTax} className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800">Add</button>

            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>

          </div>

        ) : (

          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors mt-1">

            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-base leading-none">+</span>

            {t("settings.addTax")}

          </button>

        )}

      </div>

      <SaveBtn onClick={() => onSave(t("settings.tax") + " saved!")} />

    </Section>

  );

}

 

// ═══════════════════════════════════════════════════════════════════════════════

// 3. OPERATING HOURS

// ═══════════════════════════════════════════════════════════════════════════════

function OperatingHours({ onSave }: OnSaveProps) {

  const { t } = useLang();

  const [hours, setHours] = useState<HourEntry[]>([]);

  useEffect(() => { getAllHours().then(setHours); }, []);

  const update = (idx: number, key: keyof HourEntry, val: string | boolean) =>

    setHours((p) => p.map((h, i) => (i === idx ? { ...h, [key]: val } : h)));

 

  return (

    <Section icon="🕐" title={t("settings.hours")} subtitle={t("settings.hoursSubtitle")}>

      <div className="flex flex-col gap-2">

        {hours.map((h, idx) => (

          <div key={h.day} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${h.closed ? "border-gray-100 bg-gray-50 opacity-60" : "border-gray-100 bg-white"}`}>

            <span className="w-24 text-sm font-semibold text-gray-700 shrink-0">{h.day}</span>

            <div className="flex items-center gap-2 flex-1">

              <input type="time" value={h.open} disabled={h.closed} onChange={(e) => update(idx, "open", e.target.value)}

                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-gray-100 disabled:text-gray-400" />

              <span className="text-gray-400 text-xs font-semibold">to</span>

              <input type="time" value={h.close} disabled={h.closed} onChange={(e) => update(idx, "close", e.target.value)}

                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-gray-100 disabled:text-gray-400" />

            </div>

            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">

              <input type="checkbox" checked={h.closed} onChange={(e) => update(idx, "closed", e.target.checked)} className="w-3.5 h-3.5 accent-red-500" />

              <span className="text-xs text-gray-400 font-medium">{t("settings.closed")}</span>

            </label>

          </div>

        ))}

      </div>

      <SaveBtn onClick={async () => { await saveAllHours(hours); onSave(t("settings.hours") + " saved!"); }} />

    </Section>

  );

}

 

// ═══════════════════════════════════════════════════════════════════════════════

// 4. TABLE MANAGEMENT

// ═══════════════════════════════════════════════════════════════════════════════

const TABLE_ZONES = ["HALL", "FAMILY", "PARCEL"];

const zoneColor: Record<string, string> = {

  HALL: "bg-green-50 text-green-600", FAMILY: "bg-yellow-50 text-yellow-600", PARCEL: "bg-blue-50 text-blue-600",

};

 

function TableManagement({ onSave }: OnSaveProps) {

  const { t } = useLang();

  const [tables, setTables] = useState<TableEntry[]>([]);

  const [showAdd, setShowAdd] = useState(false);

  const [newTable, setNewTable] = useState({ name: "", zone: "HALL" });

 

  useEffect(() => { getAllTables().then(setTables); }, []);

 

  const removeTable = async (id: number) => { await deleteTable(id); setTables((p) => p.filter((tb) => tb.id !== id)); };

  const handleAddTable = async () => {

    if (!newTable.name) return;

    const added = await addTable({ name: newTable.name, zone: newTable.zone });

    setTables((p) => [...p, added]); setNewTable({ name: "", zone: "HALL" }); setShowAdd(false);

  };

 

  return (

    <Section icon="🪑" title={t("settings.tables")} subtitle={t("settings.tablesSubtitle")}>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

        {tables.map((tb) => (

          <div key={tb.id} className="relative p-4 rounded-xl border border-gray-100 bg-white shadow-sm">

            <button onClick={() => removeTable(tb.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors text-base leading-none">✕</button>

            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg shrink-0">🪑</div>

              <div className="flex-1 min-w-0">

                <p className="font-bold text-gray-800 text-base" style={{ fontFamily: "'Playfair Display',serif" }}>{tb.name}</p>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${zoneColor[tb.zone] ?? "bg-gray-100 text-gray-500"}`}>{tb.zone}</span>

              </div>

            </div>

          </div>

        ))}

        {showAdd ? (

          <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 flex flex-col gap-2.5">

            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{t("settings.newTable")}</p>

            <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"

              placeholder={t("settings.tableNumber")} value={newTable.name} onChange={(e) => setNewTable({ ...newTable, name: e.target.value })} />

            <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"

              value={newTable.zone} onChange={(e) => setNewTable({ ...newTable, zone: e.target.value })}>

              {TABLE_ZONES.map((z) => <option key={z}>{z}</option>)}

            </select>

            <div className="flex gap-2">

              <button onClick={handleAddTable} className="flex-1 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800">{t("settings.addTable")}</button>

              <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-medium rounded-lg hover:bg-white">{t("settings.cancel")}</button>

            </div>

          </div>

        ) : (

          <button onClick={() => setShowAdd(true)} className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-emerald-600 min-h-[120px]">

            <span className="text-3xl">+</span>

            <span className="text-xs font-semibold">{t("settings.addTable")}</span>

          </button>

        )}

      </div>

      <SaveBtn onClick={() => onSave(t("settings.tables") + " saved!")} />

    </Section>

  );

}

 

// ═══════════════════════════════════════════════════════════════════════════════

// MAIN SETTINGS PAGE

// ═══════════════════════════════════════════════════════════════════════════════

export default function SettingsPage() {

  const { t } = useLang();

  const [activeSection, setActiveSection] = useState<SectionKey>("restaurant");

  const [toast, setToast] = useState<string>("");

 

  const SECTIONS: SectionNav[] = [

    { key: "restaurant", label: t("settings.restaurantInfo"), icon: "🏪" },

    { key: "tax",        label: t("settings.tax"),            icon: "🧾" },

    { key: "hours",      label: t("settings.hours"),          icon: "🕐" },

    { key: "tables",     label: t("settings.tables"),         icon: "🪑" },

    { key: "language",   label: t("settings.language"),       icon: "🌐" }, // ✅ Language option

  ];

 

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

 

  return (

    <div className="h-screen overflow-hidden bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;…

        @keyframes toastUp { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }

        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

      `}</style>

 

      <Navbar variant="module" moduleName={t("settings.title")} />

 

      <div className="flex h-[calc(100vh-76px)]">

        <aside className="w-56 shrink-0 bg-white border-r border-gray-100 shadow-sm hidden sm:flex flex-col pt-4 gap-1 px-2 sticky top-20 h-[calc(100vh-76px)]">

          <div className="flex-1 flex flex-col gap-1 overflow-y-auto">

            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-3 mb-2">{t("settings.sections")}</p>

            {SECTIONS.map((s) => (

              <button key={s.key} onClick={() => setActiveSection(s.key)}

                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full ${activeSection === s.key ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}>

                <span className="text-base">{s.icon}</span>

                {s.label}

                {activeSection === s.key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}

              </button>

            ))}

          </div>

          <div className="border-t border-gray-100 px-2 py-4"><BackButton /></div>

        </aside>

 

        <div className="sm:hidden w-full fixed bottom-0 left-0 z-40 bg-white border-t border-gray-100 flex">

          {SECTIONS.map((s) => (

            <button key={s.key} onClick={() => setActiveSection(s.key)}

              className={`flex-1 flex flex-col items-center py-2 text-[10px] font-semibold transition-colors ${activeSection === s.key ? "text-emerald-700" : "text-gray-400"}`}>

              <span className="text-lg">{s.icon}</span>

              {s.label.split(" ")[0]}

            </button>

          ))}

        </div>

 

        <main className="flex-1 px-4 sm:px-8 py-6 pb-24 sm:pb-6 overflow-y-auto h-full" style={{ animation: "fadeIn .3s ease" }}>

          <div className="max-w-3xl" key={activeSection} style={{ animation: "fadeIn .25s ease" }}>

            {activeSection === "restaurant" && <RestaurantInfo   onSave={showToast} />}

            {activeSection === "tax"        && <TaxSettings      onSave={showToast} />}

            {activeSection === "hours"      && <OperatingHours   onSave={showToast} />}

            {activeSection === "tables"     && <TableManagement  onSave={showToast} />}

            {activeSection === "language"   && <LanguageSettings onSave={showToast} />} {/* ✅ YE THA MISSING */}

          </div>

        </main>

      </div>

 

      {toast && <Toast message={toast} />}

    </div>

  );

}