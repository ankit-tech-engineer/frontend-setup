import axiosInstance from './axiosInstance';
import { QueryParams } from './types';
import { Role } from './roles';

export interface User {
  _id: string;
  id: number;
  name: string;
  email: string;
  roles: Role[];
  vendorId: number;
  isVerified: boolean;
  isActive: boolean;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  tenantKey: string;
}

export interface UsersResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: User[];
}

export const getUsers = async (params?: QueryParams): Promise<UsersResponse> => {
  const response = await axiosInstance.get('/users/', { params });
  return response.data;
};

export const createUser = async (data: any): Promise<any> => {
  const response = await axiosInstance.post('/users/', data);
  return response.data;
};

export const updateUser = async (id: number, data: any): Promise<any> => {
  const response = await axiosInstance.patch(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

export const activateUser = async (id: number): Promise<any> => {
  const response = await axiosInstance.post(`/users/activate/${id}`);
  return response.data;
};

export const deactivateUser = async (id: number): Promise<any> => {
  const response = await axiosInstance.post(`/users/deactivate/${id}`);
  return response.data;
};
