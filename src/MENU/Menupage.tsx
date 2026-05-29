import { useState, useEffect } from "react";
import { getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from "../Api/menuApi";
import Navbar from "../components/Navbar.js";
import BackButton from "../components/BackButton.js";
import { useLang } from "../context/languageContext";

type Category = "Veg" | "Non-Veg";
type FilterOption = "All" | Category;
 
interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: Category;
}
 
interface MenuForm {
  name: string;
  price: string;
  category: Category;
}

const defaultForm: MenuForm = { name: "", price: "", category: "Veg" };
 
// ─── Badges ────────────────────────────────────────────────────────────────────
const VegBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#edf7f0] text-[#1e7a3e] border border-[#a8d8b8]">
    <span className="w-1.5 h-1.5 rounded-full bg-[#2ecc71]" />
    {label}
  </span>
);

const NonVegBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#fdf0ef] text-[#c0392b] border border-[#f5b5b0]">
    <span className="w-1.5 h-1.5 rounded-full bg-[#e74c3c]" />
    {label}
  </span>
);
 
// ─── Main ──────────────────────────────────────────────────────────────────────
export default function MenuPage() {
  const { t } = useLang();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<FilterOption>("All");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<MenuForm>(defaultForm);

  useEffect(() => {
    getAllMenuItems().then(setItems);
  }, []);

  const matchesSearch = (name: string, query: string): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    const lower = name.toLowerCase();
    if (lower.includes(q)) return true;
    const initials = name.split(" ").map((w) => w.charAt(0).toLowerCase()).join("");
    return initials.includes(q);
  };
 
  const filtered = items.filter(
    (i) => matchesSearch(i.name, search) && (filter === "All" || i.category === filter)
  );
 
  const vegCount = items.filter((i) => i.category === "Veg").length;
  const nonVegCount = items.filter((i) => i.category === "Non-Veg").length;

  const openAdd = () => { setEditId(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (item: MenuItem) => {
    setEditId(item.id);
    setForm({ name: item.name, price: String(item.price), category: item.category });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(defaultForm); };

  const handleSave = async (): Promise<void> => {
    const trimmedName = form.name.trim();
    const parsedPrice = parseInt(form.price);
    if (!trimmedName || isNaN(parsedPrice) || parsedPrice < 0) return;
 
    if (editId !== null) {
      const updated = await updateMenuItem(editId, { name: trimmedName, price: parsedPrice, category: form.category });
      setItems((prev) => prev.map((i) => i.id === editId ? updated : i));
    } else {
      const newItem = await addMenuItem({ name: trimmedName, price: parsedPrice, category: form.category });
      setItems((prev) => [...prev, newItem]);
    }
    closeModal();
  };

  const handleDelete = async (id: number): Promise<void> => {
    await deleteMenuItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filterLabels: { key: FilterOption; label: string }[] = [
    { key: "All",     label: t("menu.all") },
    { key: "Veg",     label: t("menu.veg") },
    { key: "Non-Veg", label: t("menu.nonVeg") },
  ];

  const modalFields: { label: string; key: keyof Pick<MenuForm, "name" | "price">; type: string; placeholder: string }[] = [
    { label: t("menu.itemName"), key: "name",  type: "text",   placeholder: t("menu.itemPlaceholder") },
    { label: t("menu.price"),    key: "price", type: "number", placeholder: t("menu.pricePlaceholder") },
  ];

  const tableHeaders = ["#", t("menu.itemName"), t("menu.price"), t("menu.category"), "Actions"];

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans pb-20">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <Navbar variant="module" moduleName={t("menu.title")} />

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 mb-5">
          <div className="bg-white border-l-4 border-[#7c3aed] rounded-xl px-3 sm:px-5 py-3 sm:py-4 shadow-sm">
            <p className="text-[9px] sm:text-[11px] text-[#6b7280] uppercase tracking-[1.5px] mb-1 truncate">{t("menu.totalItems")}</p>
            <p className="text-xl sm:text-2xl font-medium text-[#111827]">{items.length}</p>
          </div>
          <div className="bg-white border-l-4 border-[#059669] rounded-xl px-3 sm:px-5 py-3 sm:py-4 shadow-sm">
            <p className="text-[9px] sm:text-[11px] text-[#6b7280] uppercase tracking-[1.5px] mb-1 truncate">{t("menu.veg")}</p>
            <p className="text-xl sm:text-2xl font-medium text-[#111827]">{vegCount}</p>
          </div>
          <div className="bg-white border-l-4 border-[#dc2626] rounded-xl px-3 sm:px-5 py-3 sm:py-4 shadow-sm">
            <p className="text-[9px] sm:text-[11px] text-[#6b7280] uppercase tracking-[1.5px] mb-1 truncate">{t("menu.nonVeg")}</p>
            <p className="text-xl sm:text-2xl font-medium text-[#111827]">{nonVegCount}</p>
          </div>
        </div>
 
        {/* Controls — search+filters left, Add New Item right (like image) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 mb-3">
          {/* Left: search + filter buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("menu.search")}
                className="w-full bg-white border border-[#d1d5db] rounded-lg pl-9 pr-3 py-2 text-[13px] text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#0d9488] transition-colors shadow-sm"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#9ca3af" strokeWidth="1.3" />
                <path d="M10.5 10.5l3 3" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex gap-2">
              {filterLabels.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-[12px] border transition-colors ${
                    filter === key
                      ? "bg-[#0d9488] border-[#0d9488] text-white"
                      : "bg-white border-[#d1d5db] text-[#374151] hover:border-[#0d9488] hover:text-[#0d9488]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Add New Item — navbar gradient */}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 text-white text-[12px] sm:text-[13px] font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg whitespace-nowrap transition-opacity hover:opacity-90 shadow-sm"
            style={{ background: "linear-gradient(to right, #0d1117, #0d6e5f)" }}
          >
            <span className="text-[16px] leading-none">+</span>
            {t("menu.addNew")}
          </button>
        </div>

        {/* DESKTOP: Table */}
        <div className="hidden md:block bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden shadow-sm">
          <div className="max-h-105 overflow-y-auto">
            <table className="w-full text-[13.5px]">
              <thead className="bg-[#f9fafb] sticky top-0 z-10">
                <tr>
                  {tableHeaders.map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10.5px] font-medium text-[#9ca3af] uppercase tracking-[1.8px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-[#9ca3af] text-[14px]">{t("menu.noItems")}</td></tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id} className="border-t border-[#f3f4f6] hover:bg-[#f0fdf4] transition-colors">
                      <td className="px-5 py-3.5 text-[#9ca3af] text-[12px]">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-[#111827]">{item.name}</td>
                      <td className="px-5 py-3.5 text-[#059669] text-[15px] font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>₹{item.price}</td>
                      <td className="px-5 py-3.5">
                        {item.category === "Veg"
                          ? <VegBadge label={t("menu.veg")} />
                          : <NonVegBadge label={t("menu.nonVeg")} />}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(item)} className="px-3 py-1 text-[11.5px] border border-[#e5e7eb] rounded-lg text-[#374151] hover:border-[#0d9488] hover:text-[#0d9488] hover:bg-[#0d9488]/10 transition-colors">{t("menu.edit")}</button>
                          <button onClick={() => handleDelete(item.id)} className="px-3 py-1 text-[11.5px] border border-[#e5e7eb] rounded-lg text-[#374151] hover:border-[#dc2626] hover:text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors">{t("menu.delete")}</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE: Card list */}
        <div className="md:hidden space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#e5e7eb] rounded-2xl py-12 text-center text-[#9ca3af] text-[14px]">{t("menu.noItems")}</div>
          ) : (
            filtered.map((item, idx) => (
              <div key={item.id} className="bg-white border border-[#e5e7eb] rounded-xl px-4 py-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] text-[#9ca3af] shrink-0">#{idx + 1}</span>
                    <span className="font-medium text-[14px] text-[#111827] truncate">{item.name}</span>
                  </div>
                  {item.category === "Veg"
                    ? <VegBadge label={t("menu.veg")} />
                    : <NonVegBadge label={t("menu.nonVeg")} />}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#059669] text-[15px] font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>₹{item.price}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="px-3 py-1 text-[11.5px] border border-[#e5e7eb] rounded-lg text-[#374151] hover:border-[#0d9488] hover:text-[#0d9488] hover:bg-[#0d9488]/10 transition-colors">{t("menu.edit")}</button>
                    <button onClick={() => handleDelete(item.id)} className="px-3 py-1 text-[11.5px] border border-[#e5e7eb] rounded-lg text-[#374151] hover:border-[#dc2626] hover:text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors">{t("menu.delete")}</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
 
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#111827]/50 flex items-center justify-center z-50 px-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-7 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="text-[17px] sm:text-[19px] font-medium text-[#111827]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {editId !== null ? t("menu.editItem") : t("menu.addItem")}
              </h2>
              <button onClick={closeModal} className="text-[#9ca3af] hover:text-[#111827] text-xl leading-none px-1 transition-colors">×</button>
            </div>
 
            {modalFields.map((field) => (
              <div key={field.key} className="mb-3.5">
                <label className="block text-[11px] text-[#6b7280] uppercase tracking-[1.2px] mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  placeholder={field.placeholder}
                  min={field.type === "number" ? 0 : undefined}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#0d9488] transition-colors"
                />
              </div>
            ))}
 
            <div className="mb-5">
              <label className="block text-[11px] text-[#6b7280] uppercase tracking-[1.2px] mb-1.5">{t("menu.category")}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#111827] outline-none focus:border-[#0d9488] transition-colors cursor-pointer"
              >
                <option value="Veg">{t("menu.veg")}</option>
                <option value="Non-Veg">{t("menu.nonVeg")}</option>
              </select>
            </div>
 
            <div className="flex justify-end gap-2 sm:gap-3">
              <button onClick={closeModal} className="px-4 sm:px-5 py-2 text-[13px] border border-[#e5e7eb] rounded-lg text-[#374151] hover:border-[#9ca3af] hover:text-[#111827] transition-colors">
                {t("menu.cancel")}
              </button>
              <button
                onClick={handleSave}
                className="px-4 sm:px-5 py-2 text-[13px] font-medium text-white rounded-lg transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(to right, #0d1117, #0d6e5f)" }}
              >
                {editId !== null ? t("menu.saveChanges") : t("menu.addItem")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}