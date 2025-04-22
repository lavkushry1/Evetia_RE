import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Team } from '../models/team.model';

const teamRepository = AppDataSource.getRepository(Team);

export class TeamController {
  async getAllTeams(_req: Request, res: Response) {
    try {
      const teams = await teamRepository.find({
        order: { name: 'ASC' }
      });
      return res.json(teams);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching teams', error });
    }
  }

  async getTeamById(req: Request, res: Response) {
    try {
      const team = await teamRepository.findOne({
        where: { id: req.params.id }
      });
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      return res.json(team);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching team', error });
    }
  }

  async createTeam(req: Request, res: Response) {
    try {
      const team = teamRepository.create(req.body);
      await teamRepository.save(team);
      return res.status(201).json(team);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating team', error });
    }
  }

  async updateTeam(req: Request, res: Response) {
    try {
      const team = await teamRepository.findOne({
        where: { id: req.params.id }
      });
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      teamRepository.merge(team, req.body);
      const updatedTeam = await teamRepository.save(team);
      
      return res.json(updatedTeam);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating team', error });
    }
  }

  async deleteTeam(req: Request, res: Response) {
    try {
      const team = await teamRepository.findOne({
        where: { id: req.params.id }
      });
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      await teamRepository.remove(team);
      return res.json({ message: 'Team deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting team', error });
    }
  }
}