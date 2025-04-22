import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import stadiumRoutes from './routes/stadium.routes';
import teamRoutes from './routes/team.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import discountRoutes from './routes/discount.routes';
import adminRoutes from './routes/admin.routes';

// Load environment variables
dotenv.config();

// Create Express app
export const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler); 