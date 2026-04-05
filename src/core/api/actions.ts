import axiosInstance from './axiosInstance';
import { QueryParams } from './types';

export interface Action {
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

export interface ActionsResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: Action[];
}

export const getActions = async (params?: QueryParams): Promise<ActionsResponse> => {
  const response = await axiosInstance.get('/acl/actions', { params });
  return response.data;
};

export const createAction = async (data: { name: string }): Promise<any> => {
  const response = await axiosInstance.post('/acl/actions', data);
  return response.data;
};

export const updateAction = async (id: number, data: { name?: string; key?: string; status?: string }): Promise<any> => {
  const response = await axiosInstance.patch(`/acl/actions/${id}`, data);
  return response.data;
};

export const deleteAction = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/acl/actions/${id}`);
  return response.data;
};
