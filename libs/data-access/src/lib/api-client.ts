import axios from 'axios';

// Create a single axios instance to handle all API calls
export const apiClient = axios.create({
  // Vite proxy will handle the /api prefix and forward to localhost:8080
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to automatically inject the JWT if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});