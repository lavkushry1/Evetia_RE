import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import './models/associations';  // Import models and associations
import authRoutes from './routes/auth.routes';
import teamRoutes from './routes/team.routes';
import stadiumRoutes from './routes/stadium.routes';
import eventRoutes from './routes/event.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import discountRoutes from './routes/discount.routes';
import settingsRoutes from './routes/settings.routes';
import { errorHandler } from './middleware/error.middleware';
import { helmetMiddleware, additionalSecurityHeaders } from './middleware/helmet.middleware';
import { apiLimiter, authLimiter, bookingLimiter, paymentLimiter, searchLimiter } from './middleware/rate-limit.middleware';
import config from './config';
import { SocketService } from './services/socket.service';

// Create Express application
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const socketService = SocketService.getInstance(httpServer);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Eventia API Documentation"
}));

// Security middleware
app.use(helmetMiddleware);
app.use(additionalSecurityHeaders);
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/bookings', bookingLimiter);
app.use('/api/payments', paymentLimiter);
app.use('/api/events/search', searchLimiter);
app.use('/api/stadiums/search', searchLimiter);
app.use('/api/teams/search', searchLimiter);

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static file serving
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Error handling
app.use(errorHandler);

// Export the app and socket service
export { app as server, socketService };