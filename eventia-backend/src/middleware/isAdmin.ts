import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking admin status', error });
  }
}; 