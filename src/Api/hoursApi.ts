import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/hours";

export const getAllHours = async () => {
    const res = await axiosInstance.get(BASE_URL);
    return res.data;
};

export const saveAllHours = async (hours: object[]) => {
    const res = await axiosInstance.post(`${BASE_URL}/save-all`, hours);
    return res.data;
};

export const updateHours = async (id: number, hours: object) => {
    const res = await axiosInstance.put(`${BASE_URL}/${id}`, hours);
    return res.data;
};