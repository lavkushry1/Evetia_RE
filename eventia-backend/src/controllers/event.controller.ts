import { Request, Response } from 'express';
import { Event } from '../models/event.model';
import { Team } from '../models/team.model';
import { Stadium } from '../models/stadium.model';

interface CreateEventRequest extends Request {
  body: {
    title: string;
    description: string;
    date: string;
    price: number;
    availableSeats: number;
    teamId: number;
    stadiumId: number;
  };
}

// Get all events
export const getEvents = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const events = await Event.findAll({
      include: [
        { model: Team },
        { model: Stadium }
      ]
    });
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching events', error });
  }
};

// Get single event
export const getEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: Team },
        { model: Stadium }
      ]
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
    const teamId = parseInt(req.params.teamId);
    
    const events = await Event.findAll({
      where: {
        teamId
      },
      include: [
        { model: Team },
        { model: Stadium }
      ]
    });
    
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching team events', error });
  }
};

// Create event
export const createEvent = async (req: CreateEventRequest, res: Response): Promise<Response> => {
  try {
    const { title, description, date, price, availableSeats, teamId, stadiumId } = req.body;

    const team = await Team.findByPk(teamId);
    const stadium = await Stadium.findByPk(stadiumId);

    if (!team || !stadium) {
      return res.status(404).json({ message: 'Team or stadium not found' });
    }

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      price,
      availableSeats,
      teamId,
      stadiumId
    });

    return res.status(201).json(event);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating event', error });
  }
};

// Update event
export const updateEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const { title, date, description, price, availableSeats, teamId, stadiumId } = req.body;
    
    // Update team if provided
    if (teamId) {
      const team = await Team.findByPk(teamId);
      if (!team) {
        return res.status(400).json({ message: 'Team not found' });
      }
    }
    
    // Update stadium if provided
    if (stadiumId) {
      const stadium = await Stadium.findByPk(stadiumId);
      if (!stadium) {
        return res.status(400).json({ message: 'Stadium not found' });
      }
    }
    
    // Update event
    await event.update({
      title,
      date: date ? new Date(date) : undefined,
      description,
      price: price ? parseFloat(price) : undefined,
      availableSeats: availableSeats ? parseInt(availableSeats) : undefined,
      teamId,
      stadiumId
    });
    
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating event', error });
  }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Delete event
    await event.destroy();
    
    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting event', error });
  }
};