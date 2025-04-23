import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        
        if (!user || user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }
        
        next();
    } catch (error) {
        next(error);
    }
}; 