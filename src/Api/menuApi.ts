import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/menu";

export const getAllMenuItems = async () => {
    const res = await axiosInstance.get(BASE_URL);
    return res.data;
};

export const addMenuItem = async (item: object) => {
    const res = await axiosInstance.post(BASE_URL, item);
    return res.data;
};

export const updateMenuItem = async (id: number, item: object) => {
    const res = await axiosInstance.put(`${BASE_URL}/${id}`, item);
    return res.data;
};

export const deleteMenuItem = async (id: number) => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
};