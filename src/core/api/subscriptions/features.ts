import axiosInstance from '../axiosInstance';
import { QueryParams } from '../types';

export interface Feature {
  _id: string;
  id: number;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturesResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: Feature[];
}

export const getFeatures = async (params?: QueryParams): Promise<FeaturesResponse> => {
  const response = await axiosInstance.get('/subscriptions/features/', { params });
  return response.data;
};

export const createFeature = async (data: Partial<Feature>): Promise<any> => {
  const response = await axiosInstance.post('/subscriptions/features/', data);
  return response.data;
};

export const updateFeature = async (id: number, data: Partial<Feature>): Promise<any> => {
  const response = await axiosInstance.patch(`/subscriptions/features/${id}`, data);
  return response.data;
};

export const deleteFeature = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/subscriptions/features/${id}`);
  return response.data;
};
