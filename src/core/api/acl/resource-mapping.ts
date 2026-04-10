import axiosInstance from '../axiosInstance';
import { QueryParams } from '../types';

export interface ResourceMappingItem {
  name: string;
  key: string;
  id: number;
}

export interface ResourceMapping {
  _id: string;
  id: number;
  module_name: string;
  key: string;
  resources: ResourceMappingItem[];
  account_key: string | null;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceMappingResponse {
  success: boolean;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: ResourceMapping[];
}

export const getResourceMappings = async (params?: QueryParams): Promise<ResourceMappingResponse> => {
  const response = await axiosInstance.get('/acl/module-resource-mapping', { params });
  return response.data;
};

export const createResourceMapping = async (data: { 
  module_name: string; 
  resources: number[]; 
  status: string 
}): Promise<any> => {
  const response = await axiosInstance.post('/acl/module-resource-mapping', data);
  return response.data;
};

export const updateResourceMapping = async (id: number, data: { 
  module_name?: string; 
  key?: string;
  resources?: number[]; 
  status?: string 
}): Promise<any> => {
  const response = await axiosInstance.patch(`/acl/module-resource-mapping/${id}`, data);
  return response.data;
};

export const deleteResourceMapping = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/acl/module-resource-mapping/${id}`);
  return response.data;
};
