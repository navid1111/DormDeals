import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const moderationService = {
  // Get all pending listings for moderation
  getPendingListings: async () => {
    const res = await api.get('/listings', { params: { status: 'pending' } });
    return res.data;
  },

  // Get the number of pending listings
  getPendingListingsCount: async () => {
    const res = await api.get('/listings', { params: { status: 'pending' } });
    return res.data.count;
  },

  // Approve a pending listing
  approveListing: async (listingId, message = 'Listing meets community guidelines') => {
    const res = await api.put(`/moderation/listings/${listingId}`, {
      action: 'approve',
      message,
    });
    return res.data;
  }
};