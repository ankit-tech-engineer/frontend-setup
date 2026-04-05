import axiosInstance from './axiosInstance';
import { QueryParams } from './types';

export interface Vendor {
  _id: string;
  id: number;
  name: string;
  email: string;
  phone: string;
  isLoginActivate: boolean;
  onTrial: boolean;
  isPlanActivate: boolean;
  vendorType: {
    name: string;
    id: number;
    key: string;
  };
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
  tenantKey: string;
}

export interface VendorsResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: Vendor[];
}

export const getVendors = async (params?: QueryParams): Promise<VendorsResponse> => {
  const response = await axiosInstance.get('/vendors/', { params });
  return response.data;
};

export const createVendor = async (data: { name: string; email: string; phone: string; vendorType: number }): Promise<any> => {
  const response = await axiosInstance.post('/vendors/', data);
  return response.data;
};

export const updateVendor = async (id: number, data: { name: string; email: string; phone: string; vendorType: number }): Promise<any> => {
  const response = await axiosInstance.put(`/vendors/${id}`, data);
  return response.data;
};

export const deleteVendor = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/vendors/${id}`);
  return response.data;
};

export const activateLogin = async (id: number): Promise<any> => {
  const response = await axiosInstance.post(`/vendors/activate-login/${id}`);
  return response.data;
};

export const deactivateLogin = async (id: number): Promise<any> => {
  const response = await axiosInstance.post(`/vendors/deactivate-login/${id}`);
  return response.data;
};
