import axios from "axios";
 
const BASE_URL = "http://localhost:8080/api/menu";
 
export const getAllMenuItems = async () => {
    const res = await axios.get(BASE_URL);
    return res.data;
};
 
export const addMenuItem = async (item: object) => {
    const res = await axios.post(BASE_URL, item);
    return res.data;
};
 
export const updateMenuItem = async (id: number, item: object) => {
    const res = await axios.put(`${BASE_URL}/${id}`, item);
    return res.data;
};
 
export const deleteMenuItem = async (id: number) => {
    await axios.delete(`${BASE_URL}/${id}`);
};
 