import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { JwtService } from '../services/jwt.service';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';
import bcrypt from 'bcrypt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new BadRequestError('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role: 'user',
        isActive: true
      });

      const token = JwtService.generateToken({ id: user.id.toString() });
      const refreshToken = JwtService.generateRefreshToken({ id: user.id.toString() });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const token = JwtService.generateToken({ id: user.id.toString() });
      const refreshToken = JwtService.generateRefreshToken({ id: user.id.toString() });

      res.json({
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new BadRequestError('Refresh token is required');
      }

      const { accessToken, refreshToken: newRefreshToken } = JwtService.rotateRefreshToken(refreshToken);

      res.json({
        message: 'Token refreshed successfully',
        token: accessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedError('Not authenticated');
      }

      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'email', 'name', 'createdAt', 'updatedAt']
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async verifyToken(req: Request, res: Response) {
    res.json({ valid: true, user: req.user });
  }
} 