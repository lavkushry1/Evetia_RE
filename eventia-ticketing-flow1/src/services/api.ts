import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Types
interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

interface BookingData {
  eventId: string;
  quantity: number;
  totalAmount: number;
  status: string;
  userId: string;
}

interface PaymentStatusUpdate {
  paymentStatus: string;
  paymentMethod: string;
  paymentId: string;
  paymentDate: string;
}

interface PaymentSettings {
  upiVpa: string;
  merchantName: string;
  discountCode?: string;
  discountAmount?: number;
  isActive: boolean;
}

// API service
const apiService = {
  // Auth endpoints
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Booking endpoints
  createBooking: async (bookingData: BookingData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  },

  getBooking: async (bookingId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking');
    }
  },

  // Payment endpoints
  updateRequestPaymentStatus: async (bookingId: string, data: PaymentStatusUpdate) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/payments/${bookingId}/status`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update payment status');
    }
  },

  // Admin requests
  getRequests: async ({ type }: { type: string }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/requests?type=${type}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch requests');
    }
  },

  approveRequest: async (requestId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/requests/${requestId}/approve`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve request');
    }
  },

  rejectRequest: async (requestId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/requests/${requestId}/reject`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject request');
    }
  },

  // Settings endpoints
  getPaymentSettings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/payment`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment settings');
    }
  },

  updatePaymentSettings: async (settings: PaymentSettings) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/settings/payment`, settings);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update payment settings');
    }
  },

  // Discount endpoints
  validateDiscount: async (code: string, amount: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/discounts/validate`, { code, amount });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Invalid discount code');
    }
  },

  // These methods use mocked responses for development/testing
  submitUtr: async (bookingId: string, utrNumber: string) => {
    // In a real app, this would submit to your backend
    console.log(`Submitting UTR ${utrNumber} for booking ${bookingId}`);
    
    // Mock successful response
    return {
      success: true,
      bookingId,
      utrNumber,
      status: 'pending_verification'
    };
  }
};

export default apiService;