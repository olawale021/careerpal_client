import axios from 'axios';

const api = axios.create({
  withCredentials: true,
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
});

// Request interceptor 
api.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default api; 