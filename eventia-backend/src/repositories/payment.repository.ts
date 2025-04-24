import { BaseRepository } from './base.repository';
import { Payment } from '@prisma/client';

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super('payment');
  }

  async findWithDetails(id: number): Promise<Payment | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });
  }

  async findByUtrNumber(utrNumber: string): Promise<Payment | null> {
    return this.model.findFirst({
      where: { utrNumber },
      include: {
        booking: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });
  }

  async createPayment(
    bookingId: number,
    amount: number,
    status: string,
    utrNumber?: string
  ): Promise<Payment> {
    return this.transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingId,
          amount,
          status,
          utrNumber,
        },
        include: {
          booking: {
            include: {
              user: true,
              event: true,
            },
          },
        },
      });

      // Update booking status if payment is successful
      if (status === 'COMPLETED') {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });
      }

      return payment;
    });
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    return this.transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id },
        data: { status },
        include: {
          booking: true,
        },
      });

      // Update booking status if payment is successful
      if (status === 'COMPLETED') {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' },
        });
      }

      return payment;
    });
  }
} 