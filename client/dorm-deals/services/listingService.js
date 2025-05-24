import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const listingService = {
  // Get all listings with filters
  getAllListings: async (params = {}) => {
    try {
      const response = await api.get('/listings', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single listing
  getListing: async (id) => {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new listing
  createListing: async (listingData) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(listingData).forEach(key => {
        if (key !== 'images' && listingData[key] !== undefined) {
          formData.append(key, listingData[key]);
        }
      });
      
      // Append images
      if (listingData.images && listingData.images.length > 0) {
        listingData.images.forEach(image => {
          formData.append('images', image);
        });
      }
      
      const response = await api.post('/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Listing created successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update listing
  updateListing: async (id, listingData) => {
    try {
      const response = await api.put(`/listings/${id}`, listingData);
      toast.success('Listing updated successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete listing
  deleteListing: async (id) => {
    try {
      const response = await api.delete(`/listings/${id}`);
      toast.success('Listing deleted successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit bid
  submitBid: async (id, bidData) => {
    try {
      const response = await api.post(`/listings/${id}/bids`, bidData);
      toast.success('Bid submitted successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};