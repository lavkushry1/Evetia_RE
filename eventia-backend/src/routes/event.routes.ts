import { Router } from 'express';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { upload } from '../middleware/upload';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getEventsByTeam,
  uploadEventImage
} from '../controllers/event.controller';

const router = Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);
router.get('/team/:teamId', getEventsByTeam);

// Protected routes
router.post('/', auth, isAdmin, upload.single('image'), createEvent);
router.put('/:id', auth, isAdmin, upload.single('image'), updateEvent);
router.delete('/:id', auth, isAdmin, deleteEvent);

// Upload event image route
router.post(
  '/:id/image',
  auth,
  isAdmin,
  upload.single('image'),
  uploadEventImage
);

export default router;