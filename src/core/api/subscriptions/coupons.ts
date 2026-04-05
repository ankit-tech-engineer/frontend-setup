import axiosInstance from '../axiosInstance';
import { QueryParams } from '../types';

export interface Coupon {
  _id: string;
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minPurchase: number;
  maxDiscount: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponsResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    skip: number;
    limit: number;
    count: number;
    total: number;
  };
  data: Coupon[];
}

export const getCoupons = async (params?: QueryParams): Promise<CouponsResponse> => {
  const response = await axiosInstance.get('/subscriptions/coupons/', { params });
  return response.data;
};

export const createCoupon = async (data: Partial<Coupon>): Promise<any> => {
  const response = await axiosInstance.post('/subscriptions/coupons/', data);
  return response.data;
};

export const updateCoupon = async (id: number, data: Partial<Coupon>): Promise<any> => {
  const response = await axiosInstance.patch(`/subscriptions/coupons/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/subscriptions/coupons/${id}`);
  return response.data;
};
