import axiosInstance from './axiosInstance';
import { QueryParams } from './types';

export interface Resource {
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

export interface ResourcesResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: Resource[];
}

export const getResources = async (params?: QueryParams): Promise<ResourcesResponse> => {
  const response = await axiosInstance.get('/acl/resources', { params });
  return response.data;
};

export const createResource = async (data: { name: string }): Promise<any> => {
  const response = await axiosInstance.post('/acl/resources', data);
  return response.data;
};

export const updateResource = async (id: number, data: { name?: string; key?: string; status?: string }): Promise<any> => {
  const response = await axiosInstance.patch(`/acl/resources/${id}`, data);
  return response.data;
};

export const deleteResource = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/acl/resources/${id}`);
  return response.data;
};
