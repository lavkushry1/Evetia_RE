import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '../../generated/prisma';
import { PaymentService } from '../services/payment.service';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

// Extend the base Request type
interface AuthRequest extends Request {
  user: {
    id: string; // Keep as string since Express expects string
    email: string;
    role: string;
  };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class PaymentController {
  private prisma: PrismaClient;
  private paymentService: PaymentService;

  constructor() {
    this.prisma = new PrismaClient();
    this.paymentService = PaymentService.getInstance();
  }

  async createPaymentIntent(req: AuthRequest, res: Response) {
    try {
      const { amount, currency = 'usd' } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          userId: req.user?.id || '',
        },
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating payment intent', error });
    }
  }

  async createPayment(req: AuthRequest, res: Response) {
    const userId = parseInt(req.user.id); // Convert string to number for database
    const { bookingId, amount, currency, paymentMethod, status } = req.body;

    try {
      // Check if booking belongs to user
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (!booking || booking.userId !== userId) {
        throw new UnauthorizedError('Not authorized to access this booking');
      }

      const payment = await this.paymentService.createPayment({
        userId,
        bookingId,
        amount,
        currency,
        paymentMethod,
        status
      });

      res.json(payment);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }

  async updatePaymentStatus(req: AuthRequest, res: Response) {
    const userId = parseInt(req.user.id);
    const { bookingId } = req.params;
    const { status, utrNumber, paymentDate } = req.body;

    try {
      // Check if booking belongs to user
      const booking = await this.prisma.booking.findUnique({
        where: { id: parseInt(bookingId) }
      });

      if (!booking || booking.userId !== userId) {
        throw new UnauthorizedError('Not authorized to access this booking');
      }

      const payment = await this.paymentService.updatePaymentStatus(
        parseInt(bookingId),
        status,
        { utrNumber, paymentDate }
      );

      res.json(payment);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }

  async submitUtr(req: AuthRequest, res: Response) {
    const userId = parseInt(req.user.id);
    const { bookingId } = req.params;
    const { utrNumber } = req.body;

    try {
      // Check if booking belongs to user
      const booking = await this.prisma.booking.findUnique({
        where: { id: parseInt(bookingId) }
      });

      if (!booking || booking.userId !== userId) {
        throw new UnauthorizedError('Not authorized to access this booking');
      }

      const payment = await this.paymentService.submitUtr(parseInt(bookingId), utrNumber);
      res.json(payment);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }

  async getPaymentById(req: AuthRequest, res: Response) {
    const userId = parseInt(req.user.id);
    const { id } = req.params;

    try {
      const payment = await this.paymentService.getPaymentById(parseInt(id));
      
      // Check if payment belongs to user's booking
      const booking = await this.prisma.booking.findUnique({
        where: { id: payment.bookingId }
      });

      if (!booking || booking.userId !== userId) {
        throw new UnauthorizedError('Not authorized to access this payment');
      }

      res.json(payment);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }

  async getUserPayments(req: AuthRequest, res: Response) {
    const userId = parseInt(req.user.id);

    try {
      const payments = await this.paymentService.getUserPayments(userId);
      res.json(payments);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }

  async getPaymentSettings(req: Request, res: Response) {
    try {
      const settings = await this.paymentService.getPaymentSettings();
      res.json(settings);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }
}