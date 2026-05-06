import axiosInstance from "./axiosInstance";

// ── Daily Report ────────────────────────────────────────────────────
export const getDailyReport = async () => {
  const { data } = await axiosInstance.get("/api/reports/daily");
  return data;
};

// ── Monthly Report ──────────────────────────────────────────────────
export const getMonthlyReport = async (month?: number, year?: number) => {
  const { data } = await axiosInstance.get("/api/reports/monthly", {
    params: { month: month ?? 0, year: year ?? 0 },
  });
  return data;
};

// ── Top Products ────────────────────────────────────────────────────
export const getTopProducts = async (limit = 10) => {
  const { data } = await axiosInstance.get("/api/reports/top-products", {
    params: { limit },
  });
  return data;
};

// ── Custom Report ───────────────────────────────────────────────────
export const getCustomReport = async (params: {
  payment?:   string;
  orderType?: string;
  from?:      string; // "YYYY-MM-DD"
  to?:        string; // "YYYY-MM-DD"
}) => {
  const { data } = await axiosInstance.get("/api/reports/custom", { params });
  return data;
};