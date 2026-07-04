import api from "./axiosClient";

export const getAdminUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await api.get("/admin/analytics");
  return response.data;
};

export const getAdminUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};
