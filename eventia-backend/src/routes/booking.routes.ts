import express from 'express';
import { body } from 'express-validator';
import { auth as authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validate-request';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  lockSeats,
  unlockSeats,
  generateTicket,
} from '../controllers/booking.controller';

const router = express.Router();

// Create booking route
router.post(
  '/',
  authMiddleware,
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('seats').isArray().withMessage('Seats must be an array'),
    body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  validateRequest,
  createBooking
);

// Get all bookings route
router.get('/', authMiddleware, getBookings);

// Get single booking route
router.get('/:id', authMiddleware, getBooking);

// Update booking route
router.put(
  '/:id',
  authMiddleware,
  [
    body('status').optional().isIn(['pending', 'confirmed', 'cancelled']),
    body('paymentStatus').optional().isIn(['pending', 'completed', 'failed']),
  ],
  validateRequest,
  updateBooking
);

// Cancel booking route
router.post('/:id/cancel', authMiddleware, cancelBooking);

// Lock seats route
router.post(
  '/lock-seats',
  authMiddleware,
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('seats').isArray().withMessage('Seats must be an array'),
  ],
  validateRequest,
  lockSeats
);

// Unlock seats route
router.post(
  '/unlock-seats',
  authMiddleware,
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('seats').isArray().withMessage('Seats must be an array'),
  ],
  validateRequest,
  unlockSeats
);

// Generate ticket route
router.get('/:id/ticket', authMiddleware, generateTicket);

export default router;