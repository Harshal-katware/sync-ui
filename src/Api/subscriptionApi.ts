import axiosInstance from "./axiosInstance";
 
const BASE = "/api/super-admin";
 
// Get all restaurants (ADMIN users)
export const getAllRestaurants = async () => {
  const { data } = await axiosInstance.get(`${BASE}/restaurants`);
  return data;
};
 
// Activate subscription
export const activateSubscription = async (userId: number, plan: string) => {
  const { data } = await axiosInstance.post(`${BASE}/activate/${userId}?plan=${plan}`);
  return data;
};
 
// Deactivate subscription
export const deactivateSubscription = async (userId: number) => {
  const { data } = await axiosInstance.post(`${BASE}/deactivate/${userId}`);
  return data;
};