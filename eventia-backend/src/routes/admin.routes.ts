import { Router } from 'express';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { validateRequest } from '../middleware/validate-request';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

// All routes require authentication and admin privileges
router.use(auth, isAdmin, validateRequest);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/events', adminController.getAllEvents);
router.get('/bookings', adminController.getAllBookings);
router.get('/payments', adminController.getAllPayments);

export default router; 