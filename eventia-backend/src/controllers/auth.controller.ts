import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

// Register new user
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);

    // Save user
    await userRepository.save(user);

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering user', error });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching profile', error });
  }
};

// Verify token
export const verifyToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await userRepository.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json({ 
      valid: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying token', error });
  }
}; 