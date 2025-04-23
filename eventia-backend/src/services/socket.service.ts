import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { getRepository } from 'typeorm';
import { Event } from '../models/event.model';

interface SeatLock {
  userId: string;
  eventId: string;
  seats: string[];
  timestamp: number;
}

class SocketService {
  private io: SocketServer;
  private seatLocks: Map<string, SeatLock> = new Map();
  private readonly LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  constructor(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.setupSocketHandlers();
    this.startCleanupInterval();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('joinEvent', (eventId: string) => {
        socket.join(`event:${eventId}`);
      });

      socket.on('leaveEvent', (eventId: string) => {
        socket.leave(`event:${eventId}`);
      });

      socket.on('lockSeats', async (data: { eventId: string; userId: string; seats: string[] }) => {
        await this.handleSeatLock(socket, data);
      });

      socket.on('unlockSeats', (data: { eventId: string; userId: string; seats: string[] }) => {
        this.handleSeatUnlock(socket, data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private async handleSeatLock(socket: any, data: { eventId: string; userId: string; seats: string[] }) {
    const { eventId, userId, seats } = data;
    const lockKey = `${eventId}:${userId}`;

    // Check if seats are already locked
    const existingLock = this.seatLocks.get(lockKey);
    if (existingLock) {
      socket.emit('seatLockError', { message: 'Seats already locked for this user' });
      return;
    }

    // Check if seats are locked by other users
    const isLockedByOthers = Array.from(this.seatLocks.values()).some(
      (lock) => lock.eventId === eventId && lock.userId !== userId && 
      lock.seats.some(seat => seats.includes(seat))
    );

    if (isLockedByOthers) {
      socket.emit('seatLockError', { message: 'Some seats are already locked by other users' });
      return;
    }

    // Create new lock
    const lock: SeatLock = {
      userId,
      eventId,
      seats,
      timestamp: Date.now(),
    };

    this.seatLocks.set(lockKey, lock);

    // Notify all clients in the event room
    this.io.to(`event:${eventId}`).emit('seatsLocked', {
      eventId,
      userId,
      seats,
    });

    // Update event's booked seats in database
    try {
      const eventRepository = getRepository(Event);
      const event = await eventRepository.findOne({ where: { id: eventId } });
      if (event) {
        event.bookedSeats = [...new Set([...event.bookedSeats, ...seats])];
        await eventRepository.save(event);
      }
    } catch (error) {
      console.error('Error updating event seats:', error);
    }
  }

  private handleSeatUnlock(socket: any, data: { eventId: string; userId: string; seats: string[] }) {
    const { eventId, userId, seats } = data;
    const lockKey = `${eventId}:${userId}`;

    const lock = this.seatLocks.get(lockKey);
    if (lock) {
      this.seatLocks.delete(lockKey);
      this.io.to(`event:${eventId}`).emit('seatsUnlocked', {
        eventId,
        userId,
        seats,
      });
    }
  }

  private startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, lock] of this.seatLocks.entries()) {
        if (now - lock.timestamp > this.LOCK_TIMEOUT) {
          this.seatLocks.delete(key);
          this.io.to(`event:${lock.eventId}`).emit('seatsUnlocked', {
            eventId: lock.eventId,
            userId: lock.userId,
            seats: lock.seats,
          });
        }
      }
    }, 60000); // Check every minute
  }

  public getIO(): SocketServer {
    return this.io;
  }
}

export default SocketService; 