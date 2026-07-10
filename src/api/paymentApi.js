import api from "./axiosClient";

export const getPaymentConfig = async () => {
  const response = await api.get("/payments/config");
  return response.data;
};

export const getPaymentPlans = async () => {
  const response = await api.get("/plans");
  return response.data;
};

export const getMyPlans = async () => {
  const response = await api.get("/plans/my");
  return response.data;
};

export const createPaymentOrder = async (planId) => {
  const response = await api.post("/payments/create-plan-order", { plan_id: planId });
  return response.data;
};

export const verifyPayment = async (payload) => {
  const response = await api.post("/payments/verify-plan-payment", payload);
  return response.data;
};

export const markPaymentFailed = async (orderId, reason = "Payment cancelled or failed") => {
  const response = await api.post("/payments/mark-failed", {
    order_id: orderId,
    reason
  });
  return response.data;
};

export const getMyPayments = async () => {
  const response = await api.get("/payments/my");
  return response.data;
};
