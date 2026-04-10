import axiosInstance from '../axiosInstance';
import { QueryParams } from '../types';

export interface PermissionItem {
  resource: string;
  action: string[];
}

export interface RolePermission {
  _id: string;
  roleId: {
    id: number;
    name: string;
    key: string;
  };
  permissions: PermissionItem[];
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsResponse {
  success: boolean;
  code: number;
  message: string;
  data: RolePermission[];
}

export const getPermissions = async (params: QueryParams = {}): Promise<PermissionsResponse> => {
  const response = await axiosInstance.get('/acl/permissions', { params });
  return response.data;
};

export const updatePermissions = async (data: {
  roleId: number;
  permissions: PermissionItem[];
}): Promise<any> => {
  const response = await axiosInstance.post('/acl/permissions', data);
  return response.data;
};
