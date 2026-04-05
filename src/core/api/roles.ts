import axiosInstance from './axiosInstance';
import { QueryParams } from './types';

export interface Role {
  _id: string;
  id: number;
  name: string;
  key: string;
  account_key: string | null;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolesResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: Role[];
}

export const getRoles = async (params?: QueryParams): Promise<RolesResponse> => {
  const response = await axiosInstance.get('/acl/roles', { params });
  return response.data;
};

export const createRole = async (data: { name: string }): Promise<any> => {
  const response = await axiosInstance.post('/acl/roles', data);
  return response.data;
};

export const updateRole = async (id: number, data: { name?: string; key?: string }): Promise<any> => {
  const response = await axiosInstance.patch(`/acl/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/acl/roles/${id}`);
  return response.data;
};
