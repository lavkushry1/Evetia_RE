import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Event } from '../models/event.model';
import { Booking } from '../models/booking.model';
import { Payment, PaymentStatus } from '../models/payment.model';
import { AppDataSource } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export class AdminController {
  async getDashboardStats(_req: AuthRequest, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const eventRepository = AppDataSource.getRepository(Event);
      const bookingRepository = AppDataSource.getRepository(Booking);
      const paymentRepository = AppDataSource.getRepository(Payment);

      const [
        totalUsers,
        totalEvents,
        totalBookings,
        recentPayments,
      ] = await Promise.all([
        userRepository.count(),
        eventRepository.count(),
        bookingRepository.count(),
        paymentRepository.find({
          where: { status: PaymentStatus.COMPLETED },
          order: { createdAt: 'DESC' },
          take: 5,
          relations: ['user']
        })
      ]);

      // Calculate total revenue
      const completedPayments = await paymentRepository.find({ 
        where: { status: PaymentStatus.COMPLETED } 
      });
      
      const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

      return res.json({
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue,
        recentPayments,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching dashboard stats', error });
    }
  }

  async getAllUsers(_req: AuthRequest, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find({
        select: ["id", "name", "email", "firstName", "lastName", "role", "isActive", "createdAt", "updatedAt"]
      });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  async getAllEvents(_req: AuthRequest, res: Response) {
    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const events = await eventRepository.find({
        relations: ['homeTeam', 'awayTeam', 'stadium']
      });
      return res.json(events);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching events', error });
    }
  }

  async getAllBookings(_req: AuthRequest, res: Response) {
    try {
      const bookingRepository = AppDataSource.getRepository(Booking);
      const bookings = await bookingRepository.find({
        relations: ['user', 'event']
      });
      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching bookings', error });
    }
  }

  async getAllPayments(_req: AuthRequest, res: Response) {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const payments = await paymentRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' }
      });
      return res.json(payments);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching payments', error });
    }
  }
}