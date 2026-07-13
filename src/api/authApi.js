import api from "./axiosClient";

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const loginWithGoogle = async (tokenData) => {
  const response = await api.post("/auth/google/session", tokenData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const sendRegistrationOtp = async (data) => {
  const response = await api.post("/auth/send-registration-otp", data);
  return response.data;
};

export const verifyRegistrationOtp = async (data) => {
  const response = await api.post("/auth/verify-registration-otp", data);
  return response.data;
};

export const checkRegistrationOtp = async (data) => {
  const response = await api.post("/auth/check-registration-otp", data);
  return response.data;
};

export const sendForgotPasswordOtp = async (data) => {
  const response = await api.post("/auth/forgot-password/send-otp", data);
  return response.data;
};

export const verifyForgotPasswordOtp = async (data) => {
  const response = await api.post("/auth/forgot-password/verify-otp", data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/auth/forgot-password/reset", data);
  return response.data;
};

export const verifyDeleteAccount = async (data) => {
  const response = await api.post("/auth/delete-account/verify", data);
  return response.data;
};

export const confirmDeleteAccount = async (data) => {
  const response = await api.delete("/auth/delete-account/confirm", { data });
  return response.data;
};
