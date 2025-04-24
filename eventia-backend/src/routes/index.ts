import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import stadiumRoutes from './stadium.routes';
import teamRoutes from './team.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import discountRoutes from './discount.routes';
import adminRoutes from './admin.routes';
import settingsRoutes from './settings.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/stadiums', stadiumRoutes);
router.use('/teams', teamRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/discounts', discountRoutes);
router.use('/admin', adminRoutes);
router.use('/settings', settingsRoutes);

export default router; 