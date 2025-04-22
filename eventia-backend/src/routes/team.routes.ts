import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate-request';
import { TeamController } from '../controllers/team.controller';

const router = Router();
const teamController = new TeamController();

router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);
router.post('/', auth, validateRequest, teamController.createTeam);
router.put('/:id', auth, validateRequest, teamController.updateTeam);
router.delete('/:id', auth, teamController.deleteTeam);

export default router; 