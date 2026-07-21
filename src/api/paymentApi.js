import api from "./axiosClient";

export const getPaymentConfig = async () => {
  const response = await api.get("/payments/config");
  return response.data;
};

export const getPaymentPlans = async () => {
  const response = await api.get("/payments/plans");
  return response.data;
};

export const getMyPlans = async () => {
  const response = await api.get("/payments/plans/my");
  return response.data;
};

export const createCCAvenuePayment = async (payload) => {
  const response = await api.post("/payments/ccavenue/create", payload);
  return response.data;
};

export const createPaymentOrder = async (planId, paymentType = "BUYER_PASS") => {
  return createCCAvenuePayment({ plan_id: planId, payment_type: paymentType });
};

export const createSellerListingPayment = async (listingId) => {
  return createCCAvenuePayment({ listing_id: listingId, payment_type: "SELLER_LISTING" });
};

export const getPaymentStatus = async (orderId) => {
  const response = await api.get(`/payments/${orderId}/status`);
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
