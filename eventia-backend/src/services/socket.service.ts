import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import logger from './logger.service';

interface SeatLock {
  userId: string;
  eventId: string;
  seats: string[];
  timestamp: number;
}

export class SocketService {
  private static instance: SocketService;
  private io: Server;
  private seatLocks: Map<string, SeatLock> = new Map();
  private readonly LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  private constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupSocketEvents();
    this.startCleanupInterval();
  }

  public static getInstance(server: HttpServer): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService(server);
    }
    return SocketService.instance;
  }

  private setupSocketEvents(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('joinEvent', (eventId: string) => {
        socket.join(`event:${eventId}`);
        logger.info(`Client ${socket.id} joined event: ${eventId}`);
      });

      socket.on('leaveEvent', (eventId: string) => {
        socket.leave(`event:${eventId}`);
        logger.info(`Client ${socket.id} left event: ${eventId}`);
      });

      socket.on('lockSeats', async (data: { eventId: string; userId: string; seats: string[] }) => {
        await this.handleSeatLock(socket, data);
      });

      socket.on('unlockSeats', (data: { eventId: string; userId: string; seats: string[] }) => {
        this.handleSeatUnlock(socket, data);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  private async handleSeatLock(socket: any, data: { eventId: string; userId: string; seats: string[] }): Promise<void> {
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
  }

  private handleSeatUnlock(_socket: any, data: { eventId: string; userId: string; seats: string[] }): void {
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

  private startCleanupInterval(): void {
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

  public emitSeatUpdate(eventId: string, seatData: any): void {
    this.io.to(`event:${eventId}`).emit('seatUpdate', seatData);
  }

  public emitBookingUpdate(eventId: string, bookingData: any): void {
    this.io.to(`event:${eventId}`).emit('bookingUpdate', bookingData);
  }

  public emitPaymentUpdate(eventId: string, paymentData: any): void {
    this.io.to(`event:${eventId}`).emit('paymentUpdate', paymentData);
  }
} 