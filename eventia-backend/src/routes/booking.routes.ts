import { Router, Request, Response, NextFunction } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createBookingSchema, verifyPaymentSchema } from '../validations/booking.validation';

// Define AuthRequest interface
interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

const router = Router();
const bookingController = new BookingController();

// Create booking
router.post(
  '/',
  authMiddleware,
  validateRequest(createBookingSchema),
  (req: Request, res: Response, next: NextFunction) => {
    bookingController.createBooking(req as AuthRequest, res, next);
  }
);

// Verify payment
router.post(
  '/:bookingId/verify-payment',
  authMiddleware,
  validateRequest(verifyPaymentSchema),
  (req: Request, res: Response, next: NextFunction) => {
    bookingController.verifyPayment(req, res, next);
  }
);

// Get single booking
router.get(
  '/:id',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    bookingController.getBooking(req as AuthRequest, res, next);
  }
);

// Get user bookings
router.get(
  '/user/bookings',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    bookingController.getUserBookings(req as AuthRequest, res, next);
  }
);

export default router;