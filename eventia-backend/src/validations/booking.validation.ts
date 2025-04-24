import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    eventId: z.string().uuid(),
    numberOfTickets: z.number().int().min(1),
    totalAmount: z.number().positive(),
    paymentMethod: z.enum(['CARD', 'UPI', 'NET_BANKING']),
  }),
});

export const verifyPaymentSchema = z.object({
  params: z.object({
    bookingId: z.string().uuid(),
  }),
  body: z.object({
    paymentId: z.string(),
    status: z.enum(['SUCCESS', 'FAILED']),
  }),
}); 