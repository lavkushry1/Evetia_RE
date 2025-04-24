import { z } from 'zod';

// Base schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

export const PaymentSettingsSchema = z.object({
  upiVpa: z.string().regex(/^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/),
  merchantName: z.string(),
  discountCode: z.string().optional(),
  discountAmount: z.number().min(0).optional(),
  isActive: z.boolean(),
});

export const BookingTicketSchema = z.object({
  category: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  subtotal: z.number().min(0),
});

export const BookingDataSchema = z.object({
  eventTitle: z.string(),
  totalAmount: z.number().min(0),
  status: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  deliveryAddress: z.string(),
  tickets: z.array(BookingTicketSchema),
});

export const BookingResponseSchema = BookingDataSchema.extend({
  id: z.string(),
  createdAt: z.string(),
});

// Request schema
export const RequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  requestType: z.string(),
  status: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  eventId: z.string().optional(),
  eventName: z.string().optional(),
  bookingId: z.string().optional(),
  amount: z.number().optional(),
  responseMessage: z.string().optional(),
  // Payment tracking fields
  paymentStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  paymentMethod: z.string().optional(),
  paymentId: z.string().optional(),
  paymentDate: z.string().optional(),
  refundStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
  refundId: z.string().optional(),
  refundDate: z.string().optional(),
  refundAmount: z.number().optional(),
});

// Infer types from schemas
export type User = z.infer<typeof UserSchema>;
export type PaymentSettings = z.infer<typeof PaymentSettingsSchema>;
export type BookingTicket = z.infer<typeof BookingTicketSchema>;
export type BookingData = z.infer<typeof BookingDataSchema>;
export type BookingResponse = z.infer<typeof BookingResponseSchema>;
export type Request = z.infer<typeof RequestSchema>;

// API response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Custom error types
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  public toResponse(): ApiErrorResponse {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
      },
    };
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  public toResponse(): ApiErrorResponse {
    return {
      success: false,
      error: {
        message: this.message,
        code: 'VALIDATION_ERROR',
      },
    };
  }
}

// Utility types for API endpoints
export type ApiEndpoint<TInput, TOutput> = (input: TInput) => Promise<ApiResponse<TOutput>>;

export type AsyncResult<T> = Promise<ApiResponse<T>>;

// Legacy types - these are kept for backward compatibility
export interface LegacyBooking {
  id: string;
  userId: string;
  eventId: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegacyPaymentSettings {
  id: string;
  upiVpa: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegacyApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
} 