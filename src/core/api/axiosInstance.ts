import axios from 'axios';
import Cookies from 'js-cookie';

import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      // JSON Stringify complex objects/arrays per user example
      if (['filter', 'select', 'sort'].includes(key) && (typeof value === 'object' || Array.isArray(value))) {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }
});

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle standard backend "success: false" responses even with HTTP 200
    if (response.data && response.data.success === false) {
      toast.error(response.data.message || "Operation failed", {
        description: "Please check your input and try again."
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const response = error.response;

    // 1. Handle HTTP 401 Unauthorized (Token Refresh)
    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = refreshRes.data.data;
          
          Cookies.set('accessToken', accessToken, { expires: 1, secure: true, sameSite: 'strict' });
          Cookies.set('refreshToken', newRefreshToken, { expires: 7, secure: true, sameSite: 'strict' });
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    // 2. Handle Global Error Toasts for other errors
    // Skip toasting for 401 as it's either handled by refresh or redirect
    if (response?.status !== 401) {
      const errorMessage = response?.data?.message || error.message || "An unexpected error occurred";
      toast.error(errorMessage, {
        description: `Error Code: ${response?.status || 'Network Error'}`
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
