import axiosInstance from '../axiosInstance';
import { QueryParams } from '../types';

export interface VendorType {
  _id: string;
  id: number;
  name: string;
  key: string;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorTypesResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: VendorType[];
}

export const getVendorTypes = async (params?: QueryParams): Promise<VendorTypesResponse> => {
  const response = await axiosInstance.get('/vendor-types/', { params });
  return response.data;
};

export const createVendorType = async (data: { name: string }): Promise<any> => {
  const response = await axiosInstance.post('/vendor-types/', data);
  return response.data;
};

export const updateVendorType = async (id: number, data: { name: string }): Promise<any> => {
  const response = await axiosInstance.put(`/vendor-types/${id}`, data);
  return response.data;
};

export const deleteVendorType = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/vendor-types/${id}`);
  return response.data;
};
