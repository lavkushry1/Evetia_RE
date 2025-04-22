import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { auth as authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validate-request';
import {
  createStadium,
  getStadiums,
  getStadium,
  updateStadium,
  deleteStadium,
  uploadStadiumImage,
  updateSeatLayout,
} from '../controllers/stadium.controller';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/stadiums');
  },
  filename: (_req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
});

// Create stadium route
router.post(
  '/',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('capacity').isNumeric().withMessage('Capacity must be a number'),
    body('seatLayout').isObject().withMessage('Seat layout must be an object'),
  ],
  validateRequest,
  createStadium
);

// Get all stadiums route
router.get('/', getStadiums);

// Get single stadium route
router.get('/:id', getStadium);

// Update stadium route
router.put(
  '/:id',
  authMiddleware,
  [
    body('name').optional(),
    body('location').optional(),
    body('capacity').optional().isNumeric(),
    body('seatLayout').optional().isObject(),
  ],
  validateRequest,
  updateStadium
);

// Delete stadium route
router.delete('/:id', authMiddleware, deleteStadium);

// Upload stadium image route
router.post(
  '/:id/image',
  authMiddleware,
  upload.single('image'),
  uploadStadiumImage
);

// Update seat layout route
router.put(
  '/:id/seat-layout',
  authMiddleware,
  [body('seatLayout').isObject().withMessage('Seat layout must be an object')],
  validateRequest,
  updateSeatLayout
);

export default router;