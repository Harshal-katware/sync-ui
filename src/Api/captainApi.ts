import axiosInstance from "./axiosInstance";

export interface Captain {
  id: number;
  name: string;
  phone: string | null;
  active: boolean;
}

// ── GET ALL ───────────────────────────────────────────────────────────────────
export const getAllCaptains = (): Promise<Captain[]> =>
  axiosInstance.get<Captain[]>("/api/captains").then((r) => r.data);

// ── GET ACTIVE (POS dropdown ke liye) ────────────────────────────────────────
export const getActiveCaptains = (): Promise<Captain[]> =>
  axiosInstance.get<Captain[]>("/api/captains/active").then((r) => r.data);

// ── ADD — debug version ───────────────────────────────────────────────────────
export const addCaptain = async (c: Omit<Captain, "id">): Promise<Captain> => {
  const payload = {
    name:   c.name.trim(),
    phone:  c.phone && c.phone.trim() !== "" ? c.phone.trim() : null,
    active: true,
  };

  console.log("📤 Sending captain payload:", JSON.stringify(payload));

  try {
    const response = await axiosInstance.post<Captain>("/api/captains", payload);
    return response.data;
  } catch (error: any) {
    // ✅ Exact backend error print karega
    console.error("❌ Backend response status:", error.response?.status);
    console.error("❌ Backend response data:",   error.response?.data);
    console.error("❌ Backend response headers:", error.response?.headers);
    throw error;
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateCaptain = async (id: number, c: Captain): Promise<Captain> => {
  const payload = {
    name:   c.name.trim(),
    phone:  c.phone && c.phone.trim() !== "" ? c.phone.trim() : null,
    active: c.active,
  };

  try {
    const response = await axiosInstance.put<Captain>(`/api/captains/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error("❌ Update error:", error.response?.data);
    throw error;
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteCaptain = (id: number): Promise<void> =>
  axiosInstance.delete(`/api/captains/${id}`).then(() => undefined);