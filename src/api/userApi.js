import api from "./axiosClient";

export const getMyBids = async () => {
  const response = await api.get("/users/me/bids");
  return response.data;
};

export const getMyWins = async () => {
  const response = await api.get("/users/me/wins");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put("/users/profile", data);
  return response.data;
};
