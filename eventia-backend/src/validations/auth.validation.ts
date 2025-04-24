import { z } from 'zod';

// Validation schema for user registration
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional()
  })
});

// Validation schema for user login
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
  })
});

// Validation schema for refresh token
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
  })
}); 