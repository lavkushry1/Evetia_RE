import QRCode from 'qrcode';
import { PrismaClient } from '../../generated/prisma';
import logger from './logger.service';
import EmailService from './email.service';
import { Payment, PaymentStatus, PaymentMethod } from '../models/payment.model';
import { Booking } from '../models/booking.model';
import { Settings } from '../models/settings.model';
import { Op } from 'sequelize';
import { BadRequestError, NotFoundError } from '../utils/errors';

// Use the generated Prisma client
const prisma = new PrismaClient();

interface CreatePaymentParams {
  userId: number;
  bookingId: number;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
}

interface UpdatePaymentParams {
  utrNumber?: string;
  paymentDate?: Date;
}

export class PaymentService {
  private static instance: PaymentService;
  private emailService: EmailService;

  private constructor() {
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public async generateUPIQR(bookingId: number, amount: number): Promise<string> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { 
          event: true,
          user: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Generate UPI URL with payment details
      const upiUrl = this.generateUPIUrl({
        pa: process.env.UPI_MERCHANT_ID || '',
        pn: 'Eventia',
        tr: bookingId.toString(),
        am: amount.toString(),
        cu: 'INR',
        tn: `Booking for ${booking.event.name}`,
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(upiUrl);
      
      // Create payment record
      await prisma.payment.create({
        data: {
          bookingId: bookingId,
          amount: amount,
          status: 'pending',
          utrNumber: null
        }
      });

      // Send email with payment instructions
      await this.emailService.sendPaymentInstructions({
        to: booking.user.email,
        name: booking.user.name,
        eventName: booking.event.name,
        amount: amount,
        bookingId: bookingId.toString(),
        qrCode: qrCode
      });

      return qrCode;
    } catch (error) {
      logger.error('Error generating UPI QR:', error);
      throw error;
    }
  }

  public async verifyPayment(bookingId: number, utr: string): Promise<boolean> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          event: true,
          payments: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Verify UTR with payment gateway (implement your verification logic here)
      const isValid = await this.verifyUTRWithGateway(utr);

      if (isValid) {
        // Update booking status
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: 'confirmed'
          }
        });

        // Update payment record
        await prisma.payment.update({
          where: { 
            id: booking.payments[0].id 
          },
          data: {
            status: 'completed',
            utrNumber: utr
          }
        });

        // Send payment confirmation email
        await this.emailService.sendPaymentConfirmation({
          to: booking.user.email,
          name: booking.user.name,
          eventName: booking.event.name,
          amount: Number(booking.payments[0].amount),
          bookingId: bookingId.toString(),
          utr: utr
        });

        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error verifying payment:', error);
      throw error;
    }
  }

  private generateUPIUrl(params: {
    pa: string;
    pn: string;
    tr: string;
    am: string;
    cu: string;
    tn: string;
  }): string {
    const { pa, pn, tr, am, cu, tn } = params;
    return `upi://pay?pa=${pa}&pn=${encodeURIComponent(pn)}&tr=${tr}&am=${am}&cu=${cu}&tn=${encodeURIComponent(tn)}`;
  }

  private async verifyUTRWithGateway(utr: string): Promise<boolean> {
    // For testing, verify that UTR is a 12-digit number
    return /^\d{12}$/.test(utr);
  }

  async createPayment(params: CreatePaymentParams) {
    const { userId, bookingId, amount, currency, paymentMethod, status } = params;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: Number(amount),
        status,
        utrNumber: null
      }
    });

    return payment;
  }

  async updatePaymentStatus(bookingId: number, status: PaymentStatus, params: UpdatePaymentParams) {
    const payment = await prisma.payment.findFirst({
      where: { bookingId }
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        ...params
      }
    });

    // If payment is completed, update booking status
    if (status === PaymentStatus.COMPLETED) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'confirmed' }
      });
    }

    return updatedPayment;
  }

  async submitUtr(bookingId: number, utrNumber: string) {
    if (!utrNumber) {
      throw new BadRequestError('UTR number is required');
    }

    const payment = await prisma.payment.findFirst({
      where: { bookingId }
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Update payment with UTR number
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        utrNumber,
        status: PaymentStatus.PENDING_VERIFICATION
      }
    });

    return updatedPayment;
  }

  async getPaymentById(id: number) {
    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  async getUserPayments(userId: number) {
    return prisma.payment.findMany({
      where: {
        booking: {
          userId
        }
      },
      include: {
        booking: {
          select: {
            id: true,
            eventId: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getPaymentSettings() {
    const settings = await prisma.upiSetting.findFirst();

    if (!settings) {
      return {
        upiVpa: 'eventia@okicici',
        merchantName: 'Eventia',
        paymentInstructions: 'Scan the QR code with any UPI app to make the payment.'
      };
    }

    return {
      upiVpa: settings.upiVpa,
      merchantName: settings.merchantName,
      paymentInstructions: 'Scan the QR code with any UPI app to make the payment.'
    };
  }
} 