import { Router } from 'express';
import * as clientController from '../controllers/client.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import * as schemas from '../validators/client.validator.js';

const router = Router();

router.use(protect);

router.post('/', validate(schemas.createClientSchema), clientController.createClient);
router.get('/', clientController.getClients);
router.get('/archived', clientController.getArchivedClients);
router.get('/:id', clientController.getClient);
router.put('/:id', validate(schemas.updateClientSchema), clientController.updateClient);
router.patch('/:id/restore', clientController.restoreClient);
router.delete('/:id', clientController.deleteClient);

export default router;
