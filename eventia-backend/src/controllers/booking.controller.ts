import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { PaymentService } from '../services/payment.service';
import { TicketService } from '../services/ticket.service';
import { CacheService } from '../services/cache.service';

const prisma = new PrismaClient();
const paymentService = PaymentService.getInstance();
const ticketService = TicketService.getInstance();
const cacheService = CacheService.getInstance();

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

export class BookingController {
  public async createBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, seats, totalAmount } = req.body;
      const userId = req.user.id;

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId: parseInt(userId, 10),
          eventId,
          status: 'pending',
          totalAmount,
          quantity: seats.length
        },
        include: {
          event: true,
          user: true
        }
      });

      // Update cache
      await cacheService.set(CacheService.KEYS.BOOKING(booking.id.toString()), booking);

      // Generate QR code for payment
      const qrCode = await paymentService.generateUPIQR(booking.id, Number(totalAmount));

      return res.json({
        success: true,
        data: {
          booking,
          qrCode
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  public async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const { utr } = req.body;

      const isValid = await paymentService.verifyPayment(parseInt(bookingId, 10), utr);

      if (isValid) {
        // Generate ticket
        const ticketPath = await ticketService.generateTicket(parseInt(bookingId, 10));

        // Update cache
        await cacheService.delete(CacheService.KEYS.BOOKING(bookingId));

        return res.json({
          success: true,
          data: {
            ticketPath
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid UTR number'
      });
    } catch (error) {
      return next(error);
    }
  }

  public async getBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Try cache first
      const cachedBooking = await cacheService.get(CacheService.KEYS.BOOKING(id));
      if (cachedBooking) {
        return res.json({
          success: true,
          data: cachedBooking
        });
      }

      const booking = await prisma.booking.findUnique({
        where: {
          id: parseInt(id, 10),
          userId: parseInt(userId, 10)
        },
        include: {
          event: true,
          user: true
        }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Update cache
      await cacheService.set(CacheService.KEYS.BOOKING(id), booking);

      return res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      return next(error);
    }
  }

  public async getUserBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;

      // Try cache first
      const cachedBookings = await cacheService.get(CacheService.KEYS.USER_BOOKINGS(userId.toString()));
      if (cachedBookings) {
        return res.json({
          success: true,
          data: cachedBookings
        });
      }

      const bookings = await prisma.booking.findMany({
        where: {
          userId: parseInt(userId, 10)
        },
        include: {
          event: true,
          user: true
        }
      });

      // Update cache
      await cacheService.set(CacheService.KEYS.USER_BOOKINGS(userId.toString()), bookings);

      return res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      return next(error);
    }
  }
}