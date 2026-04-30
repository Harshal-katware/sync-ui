import { useState } from "react";
import { useEffect } from "react";
import { getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from "../Api/menuApi";
import Navbar from "../components/Navbar.js";
import BackButton from "../components/BackButton.js";

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

// ─── Initial data ──────────────────────────────────────────────────────────────


const defaultForm: MenuForm = { name: "", price: "", category: "Veg" };

// ─── Badges ────────────────────────────────────────────────────────────────────
const VegBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#edf7f0] text-[#1e7a3e] border border-[#a8d8b8]">
    <span className="w-1.5 h-1.5 rounded-full bg-[#2ecc71]" />
    Veg
  </span>
);

const NonVegBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#fdf0ef] text-[#c0392b] border border-[#f5b5b0]">
    <span className="w-1.5 h-1.5 rounded-full bg-[#e74c3c]" />
    Non-Veg
  </span>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function MenuPage() {
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

    const initials = name
      .split(" ")
      .map((w) => w.charAt(0).toLowerCase())
      .join("");
    return initials.includes(q);
  };

  const filtered = items.filter(
    (i) =>
      matchesSearch(i.name, search) &&
      (filter === "All" || i.category === filter),
  );

  const vegCount = items.filter((i) => i.category === "Veg").length;
  const nonVegCount = items.filter((i) => i.category === "Non-Veg").length;

  const openAdd = (): void => {
    setEditId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (item: MenuItem): void => {
    setEditId(item.id);
    setForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
    });
    setShowModal(true);
  };

  const closeModal = (): void => {
    setShowModal(false);
    setEditId(null);
    setForm(defaultForm);
  };

const handleSave = async (): Promise<void> => {
    const trimmedName = form.name.trim();
    const parsedPrice = parseInt(form.price);
    if (!trimmedName || isNaN(parsedPrice) || parsedPrice < 0) return;

    if (editId !== null) {
        const updated = await updateMenuItem(editId, {
            name: trimmedName,
            price: parsedPrice,
            category: form.category,
        });
        setItems((prev) => prev.map((i) => i.id === editId ? updated : i));
    } else {
        const newItem = await addMenuItem({
            name: trimmedName,
            price: parsedPrice,
            category: form.category,
        });
        setItems((prev) => [...prev, newItem]);
    }
    closeModal();
};

  const handleDelete = async (id: number): Promise<void> => {
    await deleteMenuItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
};

  // Field config for the modal form
  const modalFields: {
    label: string;
    key: keyof Pick<MenuForm, "name" | "price">;
    type: string;
    placeholder: string;
  }[] = [
    {
      label: "Item Name",
      key: "name",
      type: "text",
      placeholder: "e.g. Paneer Tikka",
    },
    {
      label: "Price (₹)",
      key: "price",
      type: "number",
      placeholder: "e.g. 250",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap%27);`}</style>

      <Navbar variant="module" moduleName="Menu Manager" />

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 mb-5">
          {(
            [
              { label: "Total Items", value: items.length, gold: true },
              { label: "Veg", value: vegCount, gold: false },
              { label: "Non-Veg", value: nonVegCount, gold: false },
            ] as { label: string; value: number; gold: boolean }[]
          ).map((s) => (
            <div
              key={s.label}
              className="bg-white border border-[#e2d9c9] rounded-xl px-3 sm:px-5 py-3 sm:py-4"
            >
              <p className="text-[9px] sm:text-[11px] text-[#9b8e75] uppercase tracking-[1.5px] mb-1 truncate">
                {s.label}
              </p>
              <p
                className={`text-xl sm:text-2xl font-medium ${s.gold ? "text-[#c9a84c]" : "text-[#1a1200]"}`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-3">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Search menu items..."
              className="w-full bg-white border border-[#e2d9c9] rounded-lg pl-9 pr-3 py-2 text-[13px] text-[#1a1200] placeholder-[#c5b99e] outline-none focus:border-[#c9a84c] transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="4.5"
                stroke="#9ca3af"
                strokeWidth="1.3"
              />
              <path
                d="M10.5 10.5l3 3"
                stroke="#9ca3af"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex gap-2">
            {(["All", "Veg", "Non-Veg"] as FilterOption[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-[12px] border transition-colors ${
                  filter === f
                    ? "bg-[#c9a84c]/10 border-[#c9a84c] text-[#9a7a20]"
                    : "bg-white border-[#e2d9c9] text-[#6b5f50] hover:border-[#b8ac9a]"
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8943e] text-[#1a1200] text-[12px] sm:text-[13px] font-medium px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg whitespace-nowrap"
            >
              + Add New Item
            </button>
          </div>
        </div>

        {/* ── DESKTOP: Table (md and up) ── */}
        <div className="hidden md:block bg-white border border-[#e2d9c9] rounded-2xl overflow-hidden">
          <div className="max-h-105 overflow-y-auto">
            <table className="w-full text-[13.5px]">
              <thead className="bg-[#faf7f0] sticky top-0 z-10">
                <tr>
                  {["#", "Item Name", "Price", "Category", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-[10.5px] font-medium text-[#b8ac9a] uppercase tracking-[1.8px] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-[#b8ac9a] text-[14px]"
                    >
                      No items found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="border-t border-[#f0ebe0] hover:bg-[#faf7f0] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[#c5b99e] text-[12px]">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#1a1200]">
                        {item.name}
                      </td>
                      <td
                        className="px-5 py-3.5 text-[#c9a84c] text-[15px] font-medium"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        ₹{item.price}
                      </td>
                      <td className="px-5 py-3.5">
                        {item.category === "Veg" ? (
                          <VegBadge />
                        ) : (
                          <NonVegBadge />
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="px-3 py-1 text-[11.5px] border border-[#e2d9c9] rounded-lg text-[#6b5f50] hover:border-[#c9a84c] hover:text-[#9a7a20] hover:bg-[#c9a84c]/10 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1 text-[11.5px] border border-[#e2d9c9] rounded-lg text-[#6b5f50] hover:border-[#e74c3c] hover:text-[#c0392b] hover:bg-[#e74c3c]/10 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── MOBILE: Card list (below md) ── */}
        <div className="md:hidden space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#e2d9c9] rounded-2xl py-12 text-center text-[#b8ac9a] text-[14px]">
              No items found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white border border-[#e2d9c9] rounded-xl px-4 py-3.5"
              >
                {/* Top row: index + name + badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] text-[#c5b99e] shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-[14px] text-[#1a1200] truncate">
                      {item.name}
                    </span>
                  </div>
                  {item.category === "Veg" ? <VegBadge /> : <NonVegBadge />}
                </div>
                {/* Bottom row: price + actions */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[#c9a84c] text-[15px] font-medium"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    ₹{item.price}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="px-3 py-1 text-[11.5px] border border-[#e2d9c9] rounded-lg text-[#6b5f50] hover:border-[#c9a84c] hover:text-[#9a7a20] hover:bg-[#c9a84c]/10 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 text-[11.5px] border border-[#e2d9c9] rounded-lg text-[#6b5f50] hover:border-[#e74c3c] hover:text-[#c0392b] hover:bg-[#e74c3c]/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Back button */}
      <div className="fixed bottom-0 left-0 p-3 sm:p-4">
        <BackButton to="/dashboard" />
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-[#1a1200]/45 flex items-center justify-center z-50 px-4"
          onClick={(e: React.MouseEvent<HTMLDivElement>) =>
            e.target === e.currentTarget && closeModal()
          }
        >
          <div className="bg-white border border-[#e2d9c9] rounded-2xl p-5 sm:p-7 w-full max-w-md">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2
                className="text-[17px] sm:text-[19px] font-medium text-[#1a1200]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {editId !== null ? "Edit Item" : "Add New Item"}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#9b8e75] hover:text-[#1a1200] text-xl leading-none px-1 transition-colors"
              >
                ×
              </button>
            </div>

            {modalFields.map((field) => (
              <div key={field.key} className="mb-3.5">
                <label className="block text-[11px] text-[#9b8e75] uppercase tracking-[1.2px] mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  placeholder={field.placeholder}
                  min={field.type === "number" ? 0 : undefined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  className="w-full bg-[#faf7f0] border border-[#e2d9c9] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#1a1200] placeholder-[#c5b99e] outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>
            ))}

            <div className="mb-5">
              <label className="block text-[11px] text-[#9b8e75] uppercase tracking-[1.2px] mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm({ ...form, category: e.target.value as Category })
                }
                className="w-full bg-[#faf7f0] border border-[#e2d9c9] rounded-lg px-3.5 py-2.5 text-[13.5px] text-[#1a1200] outline-none focus:border-[#c9a84c] transition-colors cursor-pointer"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={closeModal}
                className="px-4 sm:px-5 py-2 text-[13px] border border-[#e2d9c9] rounded-lg text-[#6b5f50] hover:border-[#b8ac9a] hover:text-[#1a1200] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 sm:px-5 py-2 text-[13px] font-medium bg-[#c9a84c] hover:bg-[#b8943e] text-[#1a1200] rounded-lg transition-colors"
              >
                {editId !== null ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}