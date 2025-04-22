import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Stadium } from '../models/stadium.model';

const stadiumRepository = AppDataSource.getRepository(Stadium);

interface AuthRequest extends Request {
  user?: {
    id: string;  // Changed from userId to id to match auth middleware
  };
  file?: Express.Multer.File;
}

// Create stadium
export const createStadium = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { name, location, capacity } = req.body;

    const stadium = stadiumRepository.create({
      name,
      city: location,
      address: location,
      capacity: parseInt(capacity),
      // Add other fields as needed
    });

    if (req.user?.id) {
      // Handle createdBy if needed
    }

    await stadiumRepository.save(stadium);

    return res.status(201).json(stadium);
  } catch (error) {
    console.error('Create stadium error:', error);
    return res.status(500).json({ message: 'Error creating stadium' });
  }
};

// Get all stadiums
export const getStadiums = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const stadiums = await stadiumRepository.find({
      order: {
        name: 'ASC'
      }
    });
    return res.json(stadiums);
  } catch (error) {
    console.error('Get stadiums error:', error);
    return res.status(500).json({ message: 'Error getting stadiums' });
  }
};

// Get single stadium
export const getStadium = async (req: Request, res: Response): Promise<Response> => {
  try {
    const stadium = await stadiumRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    return res.json(stadium);
  } catch (error) {
    console.error('Get stadium error:', error);
    return res.status(500).json({ message: 'Error getting stadium' });
  }
};

// Update stadium
export const updateStadium = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { name, location, capacity } = req.body;

    const stadium = await stadiumRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    // Update fields
    if (name) stadium.name = name;
    if (location) {
      stadium.city = location;
      stadium.address = location;
    }
    if (capacity) stadium.capacity = parseInt(capacity);

    await stadiumRepository.save(stadium);

    return res.json(stadium);
  } catch (error) {
    console.error('Update stadium error:', error);
    return res.status(500).json({ message: 'Error updating stadium' });
  }
};

// Delete stadium
export const deleteStadium = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const stadium = await stadiumRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    await stadiumRepository.remove(stadium);
    return res.json({ message: 'Stadium deleted successfully' });
  } catch (error) {
    console.error('Delete stadium error:', error);
    return res.status(500).json({ message: 'Error deleting stadium' });
  }
};

// Upload stadium image
export const uploadStadiumImage = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const stadium = await stadiumRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    const imageUrl = `/uploads/stadiums/${req.file.filename}`;
    stadium.image = imageUrl;
    await stadiumRepository.save(stadium);

    return res.json({ imageUrl });
  } catch (error) {
    console.error('Upload stadium image error:', error);
    return res.status(500).json({ message: 'Error uploading stadium image' });
  }
};

// Update seat layout
export const updateSeatLayout = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // We'll use the seatLayout from req.body when implementing this feature
    // const { seatLayout } = req.body;

    const stadium = await stadiumRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    // Handle seatLayout update if needed
    
    await stadiumRepository.save(stadium);

    return res.json(stadium);
  } catch (error) {
    console.error('Update seat layout error:', error);
    return res.status(500).json({ message: 'Error updating seat layout' });
  }
};