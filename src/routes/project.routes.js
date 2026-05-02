import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import * as schemas from '../validators/project.validator.js';

const router = Router();

router.use(protect);

router.post('/', validate(schemas.createProjectSchema), projectController.createProject);
router.get('/archived', projectController.getArchivedProjects);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.put('/:id', validate(schemas.updateProjectSchema), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.patch('/:id/restore', projectController.restoreProject);

export default router;