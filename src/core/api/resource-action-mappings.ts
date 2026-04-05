import axiosInstance from './axiosInstance';
import { QueryParams } from './types';

export interface ResourceActionMapping {
  _id: string;
  id: number;
  resourceId: {
    name: string;
    key: string;
    id: number;
  };
  actions: {
    name: string;
    key: string;
    id: number;
  }[];
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceActionMappingsResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: ResourceActionMapping[];
}

export const getResourceActionMappings = async (params?: QueryParams): Promise<ResourceActionMappingsResponse> => {
  const response = await axiosInstance.get('/acl/resource-action-mappings', { params });
  return response.data;
};

export const createResourceActionMapping = async (data: { 
  resourceId: number; 
  actions: number[]; 
  status: string; 
}): Promise<any> => {
  const response = await axiosInstance.post('/acl/resource-action-mappings', data);
  return response.data;
};

export const updateResourceActionMapping = async (id: number, data: { 
  resourceId?: number; 
  actions?: number[]; 
  status?: string; 
}): Promise<any> => {
  const response = await axiosInstance.patch(`/acl/resource-action-mappings/${id}`, data);
  return response.data;
};

export const deleteResourceActionMapping = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/acl/resource-action-mappings/${id}`);
  return response.data;
};
