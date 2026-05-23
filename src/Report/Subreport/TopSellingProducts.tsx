import { useState, useEffect, type ChangeEvent, type JSX } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getTopProducts } from "../../Api/reportApi";
import { useLang } from "../../context/languageContext";

interface Product {
  name: string;
  qty: number;
  revenue: number;
}

type SortOrder = "high" | "low";

export default function TopSellingProducts(): JSX.Element {
  const { t } = useLang();

  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<SortOrder>("high");

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalQty, setTotalQty] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [topProduct, setTopProduct] = useState("-");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTopProducts(20)
      .then((res) => {
        setAllProducts(res.products ?? []);
        setTotalQty(res.totalQty ?? 0);
        setTotalRevenue(res.totalRevenue ?? 0);
        setTopProduct(res.topProduct ?? "-");
      })
      .catch(() => setError(t("rep.top.error")))
      .finally(() => setLoading(false));
  }, []);

  let filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  filtered = [...filtered].sort((a, b) =>
    sort === "high" ? b.qty - a.qty : a.qty - b.qty
  );

  const reset = () => {
    setSearch("");
    setSort("high");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(t("rep.top.title"), 14, 20);

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Summary", "Value"]],
      body: [
        [t("rep.top.totalItems"),   `${totalQty}`],
        [t("rep.top.totalRevenue"), `Rs. ${totalRevenue}`],
        [t("rep.top.topProduct"),   `${topProduct}`],
      ],
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    autoTable(doc, {
      startY: finalY + 10,
      head: [[t("rep.top.product"), t("rep.top.qty"), t("rep.top.revenue")]],
      body:
        filtered.length > 0
          ? filtered.map((p) => [p.name, p.qty, `Rs. ${p.revenue}`])
          : [[t("rep.top.noProducts"), "-", "-"]],
    });

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Report generated automatically", 14, 285);
    doc.save("top-products-report.pdf");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: "#1a6b52", borderTopColor: "transparent" }} />
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
        ⚠ {error}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <h1 className="text-xl sm:text-2xl font-serif">{t("rep.top.title")}</h1>

        <button
          onClick={downloadPDF}
          className="w-full sm:w-auto px-4 py-2 text-white rounded-lg shadow hover:scale-105 transition"
          style={{ background: "linear-gradient(135deg, #0d4a3a, #1a6b52)" }}
        >
          {t("rep.top.export")}
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-100 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">{t("rep.top.totalItems")}</p>
          <h2 className="text-lg font-bold text-gray-800">{totalQty}</h2>
        </div>

        <div className="bg-gray-100 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">{t("rep.top.totalRevenue")}</p>
          <h2 className="text-lg font-bold" style={{ color: "#1a6b52" }}>₹{totalRevenue}</h2>
        </div>

        <div className="text-white p-5 rounded-xl" style={{ background: "linear-gradient(135deg, #0d4a3a, #1a6b52)" }}>
          <p className="text-sm">{t("rep.top.topProduct")}</p>
          <h2 className="text-lg font-bold">{topProduct}</h2>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder={t("rep.top.search")}
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="flex-1 border p-2 rounded-lg w-full"
        />

        <select
          value={sort}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as SortOrder)}
          className="border p-2 rounded-lg w-full sm:w-auto"
        >
          <option value="high">{t("rep.top.topSelling")}</option>
          <option value="low">{t("rep.top.lowSelling")}</option>
        </select>

        <button
          onClick={reset}
          className="w-full sm:w-auto px-3 py-2 bg-gray-400 text-white rounded-lg"
        >
          {t("rep.top.reset")}
        </button>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          {allProducts.length === 0 ? t("rep.top.noOrders") : t("rep.top.noProducts")}
        </div>
      )}

      {/* Data */}
      {filtered.length > 0 && (
        <>
          {/* Chart */}
          <div className="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-sm">
            <p className="mb-3 font-semibold text-sm sm:text-base">{t("rep.top.salesChart")}</p>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filtered}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={false} />
                <Bar dataKey="qty" fill="#0d4a3a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-gray-100 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-100">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">{t("rep.top.product")}</th>
                  <th className="p-3 text-left">{t("rep.top.qty")}</th>
                  <th className="p-3 text-left">{t("rep.top.revenue")}</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p, i) => (
                  <tr key={i} className="border-t hover:bg-gray-200 transition">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.qty}</td>
                    <td className="p-3 font-medium" style={{ color: "#1a6b52" }}>₹{p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}