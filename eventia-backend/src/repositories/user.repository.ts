import { BaseRepository } from './base.repository';
import { User } from '../../generated/prisma';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('user');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
    });
  }

  async findWithBookings(id: number): Promise<User | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            event: true,
            payments: true,
          },
        },
      },
    });
  }

  async createWithBooking(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
    eventId: number,
    quantity: number,
    totalAmount: number
  ): Promise<User> {
    return this.transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...userData,
          bookings: {
            create: {
              eventId,
              quantity,
              totalAmount,
              status: 'PENDING',
            },
          },
        },
        include: {
          bookings: {
            include: {
              event: true,
            },
          },
        },
      });

      return user;
    });
  }
} 