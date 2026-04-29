import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/taxes";

export const getAllTaxes = async () => {
    const res = await axiosInstance.get(BASE_URL);
    return res.data;
};

export const addTax = async (tax: object) => {
    const res = await axiosInstance.post(BASE_URL, tax);
    return res.data;
};

export const updateTax = async (id: number, tax: object) => {
    const res = await axiosInstance.put(`${BASE_URL}/${id}`, tax);
    return res.data;
};

export const deleteTax = async (id: number) => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
};