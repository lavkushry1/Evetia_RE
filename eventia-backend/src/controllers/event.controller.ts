import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Event } from '../models/event.model';
import { Team } from '../models/team.model';
import { Stadium } from '../models/stadium.model';
import fs from 'fs';

interface CreateEventRequest extends Request {
  body: {
    name: string;
    description: string;
    date: string;
    price: number;
    capacity: number;
    homeTeamId: string;
    awayTeamId: string;
    stadiumId: string;
  };
}

const eventRepository = AppDataSource.getRepository(Event);
const teamRepository = AppDataSource.getRepository(Team);
const stadiumRepository = AppDataSource.getRepository(Stadium);

// Get all events
export const getEvents = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const events = await eventRepository.find({
      relations: ['homeTeam', 'awayTeam', 'stadium']
    });
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching events', error });
  }
};

// Get single event
export const getEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const event = await eventRepository.findOne({
      where: { id: req.params.id },
      relations: ['homeTeam', 'awayTeam', 'stadium']
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching event', error });
  }
};

// Get events by team
export const getEventsByTeam = async (req: Request, res: Response): Promise<Response> => {
  try {
    const teamId = req.params.teamId;
    
    const events = await eventRepository.find({
      where: [
        { homeTeamId: teamId },
        { awayTeamId: teamId }
      ],
      relations: ['homeTeam', 'awayTeam', 'stadium']
    });
    
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching team events', error });
  }
};

// Create event
export const createEvent = async (req: CreateEventRequest, res: Response): Promise<Response> => {
  try {
    const { name, description, date, price, capacity, homeTeamId, awayTeamId, stadiumId } = req.body;

    const homeTeam = await teamRepository.findOne({ where: { id: homeTeamId } });
    const awayTeam = await teamRepository.findOne({ where: { id: awayTeamId } });
    const stadium = await stadiumRepository.findOne({ where: { id: stadiumId } });

    if (!homeTeam || !awayTeam || !stadium) {
      return res.status(404).json({ message: 'Team or stadium not found' });
    }

    const event = eventRepository.create({
      name,
      description,
      date: new Date(date),
      price,
      capacity,
      homeTeam,
      awayTeam,
      stadium,
      bookedSeats: 0,
      isActive: true
    });

    const savedEvent = await eventRepository.save(event);
    return res.status(201).json(savedEvent);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating event', error });
  }
};

// Update event
export const updateEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const eventId = req.params.id;
    const event = await eventRepository.findOne({ where: { id: eventId } });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Update fields
    const { name, date, description, price, capacity, homeTeamId, awayTeamId, stadiumId } = req.body;
    
    if (name) event.name = name;
    if (date) event.date = new Date(date);
    if (description) event.description = description;
    if (price) event.price = parseFloat(price);
    if (capacity) event.capacity = parseInt(capacity);
    
    // Update teams if provided
    if (homeTeamId) {
      const homeTeam = await teamRepository.findOne({ where: { id: homeTeamId } });
      if (!homeTeam) {
        return res.status(400).json({ message: 'Home team not found' });
      }
      event.homeTeam = homeTeam;
    }
    
    if (awayTeamId) {
      const awayTeam = await teamRepository.findOne({ where: { id: awayTeamId } });
      if (!awayTeam) {
        return res.status(400).json({ message: 'Away team not found' });
      }
      event.awayTeam = awayTeam;
    }
    
    // Update stadium if provided
    if (stadiumId) {
      const stadium = await stadiumRepository.findOne({ where: { id: stadiumId } });
      if (!stadium) {
        return res.status(400).json({ message: 'Stadium not found' });
      }
      event.stadium = stadium as Stadium;
    }
    
    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (event.image && fs.existsSync(event.image)) {
        fs.unlinkSync(event.image);
      }
      event.image = req.file.path;
    }
    
    // Save updated event
    await eventRepository.save(event);
    
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating event', error });
  }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const eventId = req.params.id;
    const event = await eventRepository.findOne({ where: { id: eventId } });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Delete image if exists
    if (event.image && fs.existsSync(event.image)) {
      fs.unlinkSync(event.image);
    }
    
    // Delete event
    await eventRepository.remove(event);
    
    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting event', error });
  }
};

// Upload event image
export const uploadEventImage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const eventId = req.params.id;
    const event = await eventRepository.findOne({ where: { id: eventId } });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Delete old image if exists
    if (event.image && fs.existsSync(event.image)) {
      fs.unlinkSync(event.image);
    }
    
    // Update event with new image path
    event.image = req.file.path;
    await eventRepository.save(event);
    
    return res.json({ message: 'Image uploaded successfully', imagePath: event.image });
  } catch (error) {
    return res.status(500).json({ message: 'Error uploading image', error });
  }
};