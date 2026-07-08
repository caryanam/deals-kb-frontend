import api from "./axiosClient";

export const createProduct = async (data) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

export const getPublicAuctionProduct = async (productId) => {
  const response = await api.get(`/products/public/${productId}`);
  return response.data;
};

export const reviewProduct = async (productId, data) => {
  const response = await api.patch(`/products/${productId}/review`, data);
  return response.data;
};

export const startAuction = async (productId) => {
  const response = await api.post(`/products/${productId}/start-auction`);
  return response.data;
};

export const placeBid = async (productId, amount) => {
  const response = await api.post(`/products/${productId}/bid`, { amount });
  return response.data;
};

export const getProductBids = async (productId) => {
  const response = await api.get(`/products/${productId}/bids`);
  return response.data;
};

export const getPublicAuctionBids = async (productId) => {
  const response = await api.get(`/products/public/${productId}/bids`);
  return response.data;
};

export const getSellerContact = async (productId) => {
  const response = await api.get(`/products/${productId}/seller-contact`);
  return response.data;
};

export const getWinnerContact = async (productId) => {
  const response = await api.get(`/products/${productId}/winner-contact`);
  return response.data;
};

export const updateProduct = async (productId, data) => {
  const response = await api.put(`/products/${productId}`, data);
  return response.data;
};
