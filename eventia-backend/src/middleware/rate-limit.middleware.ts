import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../services/logger.service';

// Create a limiter for general API requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to handle more concurrent users
  message: 'Rate limit exceeded. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// Create a limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Increased to allow more login attempts while maintaining security
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'auth_rate_limit_exceeded',
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// Create a limiter for booking endpoints
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Increased to handle more booking attempts
  message: 'Too many booking attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Booking rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'booking_rate_limit_exceeded',
      message: 'Too many booking attempts. Please try again later.',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// Create a limiter for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit payment attempts to prevent abuse
  message: 'Too many payment attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Payment rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'payment_rate_limit_exceeded',
      message: 'Too many payment attempts. Please try again later.',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// Create a limiter for search endpoints
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Allow more search requests as they're less resource-intensive
  message: 'Too many search requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Search rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'search_rate_limit_exceeded',
      message: 'Too many search requests. Please try again later.',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});