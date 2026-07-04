import api from './axiosClient';

// 1. Create a new community request (demand)
export const createCommunityRequest = async (data) => {
  const response = await api.post('/community-requests', data);
  return response.data;
};

// 2. List all community requests with optional filters (default active)
export const getCommunityRequests = async (params = {}) => {
  const response = await api.get('/community-requests', { params });
  return response.data;
};

// 3. Retrieve user's own created and joined requests
export const getMyCommunityRequests = async () => {
  const response = await api.get('/community-requests/my');
  return response.data;
};

// 4. Retrieve single request details
export const getCommunityRequestById = async (requestId) => {
  const response = await api.get(`/community-requests/${requestId}`);
  return response.data;
};

// 5. Express interest / Join a demand request
export const joinCommunityRequest = async (requestId) => {
  const response = await api.post(`/community-requests/${requestId}/join`);
  return response.data;
};

// 6. Remove interest / Leave a demand request
export const leaveCommunityRequest = async (requestId) => {
  const response = await api.delete(`/community-requests/${requestId}/leave`);
  return response.data;
};

// 6.5. Delete a community request (Creator only)
export const deleteCommunityRequest = async (requestId) => {
  const response = await api.delete(`/community-requests/${requestId}`);
  return response.data;
};

// 7. Admin: Retrieve all site-wide community requests
export const adminGetCommunityRequests = async () => {
  const response = await api.get('/admin/community-requests');
  return response.data;
};

// 8. Admin: Update request status (active, matched, closed, disabled)
export const adminUpdateCommunityRequestStatus = async (requestId, status) => {
  const response = await api.patch(`/admin/community-requests/${requestId}/status`, { status });
  return response.data;
};
