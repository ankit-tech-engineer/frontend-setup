import axiosInstance from '../axiosInstance';
import { QueryParams } from '../types';
import { Feature } from './features';

export interface Plan {
  _id: string;
  id: number;
  name: string;
  price: number;
  validityDays: number;
  features: Feature[] | number[];
  limits: {
    MAX_USERS?: number;
    [key: string]: any;
  };
  isTrial: boolean;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: Plan[];
}

export const getPlans = async (params?: QueryParams): Promise<PlansResponse> => {
  const response = await axiosInstance.get('/subscriptions/plans/', { params });
  return response.data;
};

export const createPlan = async (data: Partial<Plan>): Promise<any> => {
  const response = await axiosInstance.post('/subscriptions/plans/', data);
  return response.data;
};

export const updatePlan = async (id: number, data: Partial<Plan>): Promise<any> => {
  const response = await axiosInstance.patch(`/subscriptions/plans/${id}`, data);
  return response.data;
};

export const deletePlan = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/subscriptions/plans/${id}`);
  return response.data;
};
