import axiosInstance from '../axiosInstance';

/**
 * Manually assign a subscription plan to a vendor.
 * @param data - The vendor and plan identification.
 */
export const manualAssignSubscription = async (data: { vendorId: number; planId: number }): Promise<any> => {
  const response = await axiosInstance.post('/subscriptions/manual-assign', data);
  return response.data;
};

// Add other subscription-wide utility APIs here as needed.
