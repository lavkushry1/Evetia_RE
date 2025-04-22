import express from 'express';
import { body } from 'express-validator';
import { register, login, verifyToken, getProfile } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate-request';
import { auth as authMiddleware } from '../middleware/auth';

const router = express.Router();

// Register route
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  validateRequest,
  register
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
);

// Get profile route
router.get('/profile', authMiddleware, getProfile);

// Verify token route
router.get('/verify', authMiddleware, verifyToken);

export default router;