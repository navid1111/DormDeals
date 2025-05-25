import axios from 'axios';
import { toast } from 'react-hot-toast';

// Make sure the base URL is correct, including the API version
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add longer timeout for image uploads
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
  
  // Don't set Content-Type for FormData/multipart requests as axios sets it automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Handle response errors globally with better error logging
api.interceptors.response.use(
  (response) => {
    console.log(`Successful response from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    const message = error.response?.data?.message || error.message || 'An error occurred';
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

  // Get listings for logged-in user
  getMyListings: async (params = {}) => {
    try {
      const response = await api.get('/listings', { 
        params: { ...params, my: true }
      });
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

  // Create new listing with better error handling
  createListing: async (listingData) => {
    try {
      console.log('Creating listing with data:', {
        ...listingData,
        images: listingData.images ? `${listingData.images.length} images` : 'No images'
      });
      
      const formData = new FormData();
      
      // Append text fields
      Object.keys(listingData).forEach(key => {
        if (key !== 'images' && listingData[key] !== undefined) {
          // For objects/arrays, stringify them
          if (typeof listingData[key] === 'object' && listingData[key] !== null) {
            formData.append(key, JSON.stringify(listingData[key]));
          } else {
            formData.append(key, listingData[key]);
          }
        }
      });
      
      // Append images
      if (listingData.images && listingData.images.length > 0) {
        // For multiple files, use the same field name for each file
        listingData.images.forEach((image, index) => {
          // Check if the image is a valid file object
          if (image instanceof File || (image && image.name && image.type)) {
            formData.append('images', image);
            console.log(`Appending image ${index + 1}: ${image.name}, size: ${image.size} bytes`);
          } else {
            console.warn(`Invalid image at index ${index}:`, image);
          }
        });
      }
      
      toast.loading('Creating your listing...', { id: 'create-listing' });
      
      const response = await api.post('/listings', formData, {
        headers: {
          // Let Axios set the Content-Type with correct boundary for FormData
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Listing created successfully!', { id: 'create-listing' });
      return response.data;
    } catch (error) {
      toast.error('Failed to create listing', { id: 'create-listing' });
      console.error('Error creating listing:', error);
      throw error;
    }
  },

  // Update listing
  updateListing: async (id, listingData) => {
    try {
      // Same FormData processing for updates with images
      if (listingData.images && listingData.images.length > 0) {
        const formData = new FormData();
        
        // Append text fields
        Object.keys(listingData).forEach(key => {
          if (key !== 'images' && listingData[key] !== undefined) {
            if (typeof listingData[key] === 'object' && listingData[key] !== null) {
              formData.append(key, JSON.stringify(listingData[key]));
            } else {
              formData.append(key, listingData[key]);
            }
          }
        });
        
        // Append images
        listingData.images.forEach(image => {
          formData.append('images', image);
        });
        
        const response = await api.put(`/listings/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Listing updated successfully!');
        return response.data;
      } else {
        // Regular JSON update if no images
        const response = await api.put(`/listings/${id}`, listingData);
        toast.success('Listing updated successfully!');
        return response.data;
      }
    } catch (error) {
      toast.error('Failed to update listing');
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