import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';

const userRepository = AppDataSource.getRepository(User);

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    const user = await userRepository.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = { id: user.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}; 