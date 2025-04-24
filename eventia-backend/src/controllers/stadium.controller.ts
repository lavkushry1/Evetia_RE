import { Request, Response } from 'express';
import { Stadium } from '../models/stadium.model';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
  file?: Express.Multer.File;
}

// Create stadium
export const createStadium = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { name, location, capacity } = req.body;

    const stadium = await Stadium.create({
      name,
      location,
      capacity: parseInt(capacity),
    });

    return res.status(201).json(stadium);
  } catch (error) {
    console.error('Create stadium error:', error);
    return res.status(500).json({ message: 'Error creating stadium' });
  }
};

// Get all stadiums
export const getStadiums = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const stadiums = await Stadium.findAll({
      order: [['name', 'ASC']]
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
    const stadium = await Stadium.findByPk(req.params.id);
    
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

    const stadium = await Stadium.findByPk(req.params.id);
    
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    await stadium.update({
      name,
      location,
      capacity: capacity ? parseInt(capacity) : undefined
    });

    return res.json(stadium);
  } catch (error) {
    console.error('Update stadium error:', error);
    return res.status(500).json({ message: 'Error updating stadium' });
  }
};

// Delete stadium
export const deleteStadium = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const stadium = await Stadium.findByPk(req.params.id);
    
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    await stadium.destroy();
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

    const stadium = await Stadium.findByPk(req.params.id);
    
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    const imageUrl = `/uploads/stadiums/${req.file.filename}`;
    await stadium.update({ image: imageUrl });

    return res.json({ imageUrl });
  } catch (error) {
    console.error('Upload stadium image error:', error);
    return res.status(500).json({ message: 'Error uploading stadium image' });
  }
};

// Update seat layout
export const updateSeatLayout = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const stadium = await Stadium.findByPk(req.params.id);
    
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    await stadium.update(req.body);
    return res.json(stadium);
  } catch (error) {
    console.error('Update seat layout error:', error);
    return res.status(500).json({ message: 'Error updating seat layout' });
  }
};