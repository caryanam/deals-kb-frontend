import api from "./axiosClient";

export const createChatRequest = async (productId) => {
  const response = await api.post("/chat-requests", { product_id: productId });
  return response.data;
};

export const getBuyerChatRequests = async () => {
  const response = await api.get("/chat-requests/buyer");
  return response.data;
};

export const getSellerChatRequests = async () => {
  const response = await api.get("/chat-requests/seller");
  return response.data;
};

export const respondToChatRequest = async (requestId, action) => {
  const response = await api.patch(`/chat-requests/${requestId}/respond`, { action });
  return response.data;
};
