import api from "./axiosClient";

// Buyer/Seller endpoints
export const createReport = async (data) => {
  const response = await api.post("/reports", data);
  return response.data;
};

export const getMyReports = async (params = {}) => {
  const response = await api.get("/reports/my", { params });
  return response.data;
};

// Admin endpoints
export const getAdminReports = async (params = {}) => {
  const response = await api.get("/admin/reports", { params });
  return response.data;
};

export const getAdminReportById = async (reportId) => {
  const response = await api.get(`/admin/reports/${reportId}`);
  return response.data;
};

export const updateReportStatus = async (reportId, data) => {
  const response = await api.patch(`/admin/reports/${reportId}/status`, data);
  return response.data;
};

export const applyAdminAction = async (reportId, data) => {
  const response = await api.post(`/admin/reports/${reportId}/action`, data);
  return response.data;
};
