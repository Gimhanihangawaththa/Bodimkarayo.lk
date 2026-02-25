import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor - runs before each request
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token here when implemented
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after receiving response
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`API Error ${status}:`, data);
      
      switch (status) {
        case 401:
          console.error('Unauthorized - Please login');
          // Redirect to login when auth is implemented
          break;
        case 403:
          console.error('Forbidden - You do not have permission');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error - Please try again later');
          break;
        default:
          console.error('An error occurred');
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error('Network Error - Backend may be offline:', error.message);
    } else {
      // Error in setting up request
      console.error('Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export { apiClient, API_BASE_URL };
