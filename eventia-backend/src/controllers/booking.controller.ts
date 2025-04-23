import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Booking } from '../models/booking.model';
import { Event } from '../models/event.model';
import { socketService } from '../server';
import pdfService from '../services/pdf.service';

const bookingRepository = AppDataSource.getRepository(Booking);
const eventRepository = AppDataSource.getRepository(Event);

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Create booking
export const createBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { eventId, seats, totalAmount } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if event exists
    const event = await eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if seats are available
    const bookedSeats = event.bookedSeats || [];
    const areSeatsAvailable = seats.every((seat: string) => !bookedSeats.includes(seat));
    
    if (!areSeatsAvailable) {
      return res.status(400).json({ message: 'Some seats are already booked' });
    }

    // Create booking
    const booking = bookingRepository.create({
      userId: req.user.id,
      eventId,
      seats,
      quantity: seats.length,
      totalAmount,
      status: 'pending'
    });

    await bookingRepository.save(booking);
    
    // Update event's booked seats
    event.bookedSeats = [...new Set([...bookedSeats, ...seats])];
    await eventRepository.save(event);

    // Notify other users through socket
    socketService.getIO().to(`event:${eventId}`).emit('seatsBooked', {
      eventId,
      seats,
      bookingId: booking.id
    });
    
    return res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ message: 'Error creating booking', error });
  }
};

// Get all bookings for a user
export const getBookings = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const bookings = await bookingRepository.find({
      where: { userId: req.user.id },
      relations: ['event'],
      order: { createdAt: 'DESC' }
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({ message: 'Error getting bookings', error });
  }
};

// Get a single booking
export const getBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const booking = await bookingRepository.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      relations: ['event']
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({ message: 'Error getting booking', error });
  }
};

// Update booking
export const updateBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { status } = req.body;

    const booking = await bookingRepository.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update fields
    if (status) booking.status = status;

    await bookingRepository.save(booking);

    // If booking is cancelled, release seats
    if (status === 'cancelled') {
      const event = await eventRepository.findOne({ where: { id: booking.eventId } });
      if (event) {
        event.bookedSeats = event.bookedSeats.filter(seat => !booking.seats.includes(seat));
        await eventRepository.save(event);

        // Notify other users through socket
        socketService.getIO().to(`event:${booking.eventId}`).emit('seatsReleased', {
          eventId: booking.eventId,
          seats: booking.seats
        });
      }
    }

    return res.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    return res.status(500).json({ message: 'Error updating booking', error });
  }
};

// Cancel booking
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const booking = await bookingRepository.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking can be cancelled (e.g., not too close to event time)
    const event = await eventRepository.findOne({ where: { id: booking.eventId } });
    if (event) {
      const eventDate = new Date(event.date);
      const now = new Date();
      const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilEvent < 24) {
        return res.status(400).json({ message: 'Bookings can only be cancelled at least 24 hours before the event' });
      }
    }
    
    booking.status = 'cancelled';
    await bookingRepository.save(booking);

    // Release seats
    if (event) {
      event.bookedSeats = event.bookedSeats.filter(seat => !booking.seats.includes(seat));
      await eventRepository.save(event);

      // Notify other users through socket
      socketService.getIO().to(`event:${booking.eventId}`).emit('seatsReleased', {
        eventId: booking.eventId,
        seats: booking.seats
      });
    }

    return res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ message: 'Error cancelling booking', error });
  }
};

// Lock seats temporarily during booking process
export const lockSeats = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { eventId, seats } = req.body;

    // Check if event exists
    const event = await eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Emit socket event to lock seats
    socketService.getIO().to(`event:${eventId}`).emit('lockSeats', {
      eventId,
      userId: req.user.id,
      seats
    });

    return res.json({ message: 'Seats locked successfully', eventId, seats });
  } catch (error) {
    console.error('Lock seats error:', error);
    return res.status(500).json({ message: 'Error locking seats', error });
  }
};

// Unlock seats if booking process is abandoned
export const unlockSeats = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { eventId, seats } = req.body;

    // Check if event exists
    const event = await eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Emit socket event to unlock seats
    socketService.getIO().to(`event:${eventId}`).emit('unlockSeats', {
      eventId,
      userId: req.user.id,
      seats
    });

    return res.json({ message: 'Seats unlocked successfully', eventId, seats });
  } catch (error) {
    console.error('Unlock seats error:', error);
    return res.status(500).json({ message: 'Error unlocking seats', error });
  }
};

// Generate ticket for confirmed booking
export const generateTicket = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const booking = await bookingRepository.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      relations: ['event', 'user']
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking is not confirmed yet' });
    }

    // Generate PDF ticket
    const pdfBuffer = await pdfService.generateTicket(booking.id);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.id}.pdf`);

    // Send the PDF
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate ticket error:', error);
    return res.status(500).json({ message: 'Error generating ticket', error });
  }
};