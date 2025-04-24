import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const adminMiddleware = async (req: Request, _: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            throw new UnauthorizedError('Not authenticated');
        }

        const admin = await prisma.admin.findUnique({
            where: { id: parseInt(userId, 10) }
        });

        if (!admin) {
            throw new UnauthorizedError('Admin access required');
        }
        
        next();
    } catch (error) {
        next(error);
    }
}; 