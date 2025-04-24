import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();
const paymentController = new PaymentController();

// Validation schemas
const createPaymentSchema = z.object({
  bookingId: z.number(),
  amount: z.number(),
  currency: z.string().default('INR'),
  paymentMethod: z.enum(['upi', 'card', 'net_banking']),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'pending_verification', 'completed', 'failed']),
  utrNumber: z.string().optional(),
  paymentDate: z.string().datetime().optional(),
});

const submitUtrSchema = z.object({
  utrNumber: z.string(),
});

// Routes
router.post(
  '/create',
  auth,
  validateRequest(createPaymentSchema),
  paymentController.createPayment
);

router.put(
  '/:bookingId/status',
  auth,
  validateRequest(updatePaymentStatusSchema),
  paymentController.updatePaymentStatus
);

router.post(
  '/:bookingId/utr',
  auth,
  validateRequest(submitUtrSchema),
  paymentController.submitUtr
);

router.get('/:id', auth, paymentController.getPaymentById);
router.get('/user/payments', auth, paymentController.getUserPayments);
router.get('/settings', paymentController.getPaymentSettings);

export default router;