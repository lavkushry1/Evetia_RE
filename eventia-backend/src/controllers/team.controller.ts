import { Request, Response } from 'express';
import { Team } from '../models/team.model';

export class TeamController {
  async getAllTeams(_req: Request, res: Response) {
    try {
      const teams = await Team.findAll({
        order: [['name', 'ASC']]
      });
      return res.json(teams);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching teams', error });
    }
  }

  async getTeamById(req: Request, res: Response) {
    try {
      const team = await Team.findByPk(req.params.id);
      
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
      const team = await Team.create(req.body);
      return res.status(201).json(team);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating team', error });
    }
  }

  async updateTeam(req: Request, res: Response) {
    try {
      const team = await Team.findByPk(req.params.id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      await team.update(req.body);
      return res.json(team);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating team', error });
    }
  }

  async deleteTeam(req: Request, res: Response) {
    try {
      const team = await Team.findByPk(req.params.id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      await team.destroy();
      return res.json({ message: 'Team deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting team', error });
    }
  }
}