import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/restaurant";

export const getRestaurantInfo = async () => {
    const res = await axiosInstance.get(BASE_URL);
    return res.data;
};

export const saveRestaurantInfo = async (info: object) => {
    const res = await axiosInstance.put(BASE_URL, info);
    return res.data;
};