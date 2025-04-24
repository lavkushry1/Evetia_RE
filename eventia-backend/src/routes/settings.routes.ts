import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { validateRequest } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();
const settingsController = new SettingsController();

// Validation schemas
const updateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional()
});

const updatePaymentSettingsSchema = z.object({
  upiVpa: z.string().min(1).optional(),
  merchantName: z.string().min(1).optional(),
  paymentInstructions: z.string().optional()
});

// Public routes
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingsByKey);
router.get('/payment/settings', settingsController.getPaymentSettings);

// Protected routes (admin only)
router.put('/', 
  auth, 
  isAdmin, 
  validateRequest(updateSettingsSchema), 
  settingsController.updateSettings
);

router.put('/payment/settings', 
  auth, 
  isAdmin, 
  validateRequest(updatePaymentSettingsSchema), 
  settingsController.updatePaymentSettings
);

export default router; 