import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/tables";

export const getAllTables = async () => {
    const res = await axiosInstance.get(BASE_URL);
    return res.data;
};

export const addTable = async (table: object) => {
    const res = await axiosInstance.post(BASE_URL, table);
    return res.data;
};

export const deleteTable = async (id: number) => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
};