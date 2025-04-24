import { BaseRepository } from './base.repository';
import { Booking } from '@prisma/client';

export class BookingRepository extends BaseRepository<Booking> {
  constructor() {
    super('booking');
  }

  async findWithDetails(id: number): Promise<Booking | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        user: true,
        event: {
          include: {
            team: true,
            stadium: true,
          },
        },
        payments: true,
      },
    });
  }

  async findUserBookings(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Booking[]; total: number; page: number; totalPages: number }> {
    const where = {
      userId,
    };

    return this.findWithPagination(page, limit, where, {
      createdAt: 'desc',
    });
  }

  async createBookingWithPayment(
    userId: number,
    eventId: number,
    quantity: number,
    totalAmount: number,
    paymentData: { amount: number; status: string; utrNumber?: string }
  ): Promise<Booking> {
    return this.transaction(async (tx) => {
      // Create booking
      const booking = await tx.booking.create({
        data: {
          userId,
          eventId,
          quantity,
          totalAmount,
          status: 'PENDING',
          payments: {
            create: {
              amount: paymentData.amount,
              status: paymentData.status,
              utrNumber: paymentData.utrNumber,
            },
          },
        },
        include: {
          user: true,
          event: true,
          payments: true,
        },
      });

      // Update event booked seats
      await tx.event.update({
        where: { id: eventId },
        data: {
          bookedSeats: {
            increment: quantity,
          },
        },
      });

      return booking;
    });
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    return this.model.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        event: true,
        payments: true,
      },
    });
  }
} 