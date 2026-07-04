import api from "./axiosClient";

export const getConversations = async () => {
  const response = await api.get("/chats");
  return response.data;
};

export const createConversation = async (productId) => {
  const response = await api.post(`/chats/products/${productId}`);
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await api.get(`/chats/${conversationId}/messages`);
  return response.data;
};

export const sendMessage = async (conversationId, message) => {
  const response = await api.post(`/chats/${conversationId}/messages`, { message });
  return response.data;
};

export const markConversationRead = async (conversationId) => {
  const response = await api.post(`/chats/${conversationId}/read`);
  return response.data;
};
