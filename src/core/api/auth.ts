import axiosInstance from './axiosInstance';

export const register = async (data: { name: string; email: string; vendorName: string; phone: string }) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

export const verifyOtp = async (data: { email: string; otp: string }) => {
  const response = await axiosInstance.post('/auth/verify-otp', data);
  return response.data;
};

export const resendOtp = async (email: string) => {
  const response = await axiosInstance.post('/auth/resend-otp', { email });
  return response.data;
};

export const setPassword = async (data: { email: string; password: string }) => {
  const response = await axiosInstance.post('/auth/set-password', data);
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};
