import { BaseRepository } from './base.repository';
import { Event } from '@prisma/client';

export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super('event');
  }

  async findWithDetails(id: number): Promise<Event | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        team: true,
        stadium: true,
        bookings: {
          include: {
            user: true,
            payments: true,
          },
        },
      },
    });
  }

  async findActiveEvents(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ data: Event[]; total: number; page: number; totalPages: number }> {
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.findWithPagination(page, limit, where, {
      date: 'asc',
    });
  }

  async updateBookedSeats(id: number, quantity: number): Promise<Event> {
    return this.transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id },
        select: { bookedSeats: true, capacity: true },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      const newBookedSeats = event.bookedSeats + quantity;
      if (newBookedSeats > event.capacity) {
        throw new Error('Not enough seats available');
      }

      return tx.event.update({
        where: { id },
        data: {
          bookedSeats: newBookedSeats,
        },
      });
    });
  }

  async findUpcomingEvents(limit: number = 5): Promise<Event[]> {
    return this.model.findMany({
      where: {
        isActive: true,
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: limit,
      include: {
        team: true,
        stadium: true,
      },
    });
  }
} 