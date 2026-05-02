import { Router } from 'express';
import * as deliveryNoteController from '../controllers/deliverynote.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import * as schemas from '../validators/deliverynote.validator.js';

const router = Router();

router.use(protect);

router.post('/', validate(schemas.createDeliveryNoteSchema), deliveryNoteController.createDeliveryNote);
router.get('/pdf/:id', deliveryNoteController.downloadDeliveryNotePdf);
router.patch('/:id/sign', validate(schemas.signDeliveryNoteSchema), deliveryNoteController.signDeliveryNote);
router.get('/', deliveryNoteController.getDeliveryNotes);
router.get('/:id', deliveryNoteController.getDeliveryNote);
router.delete('/:id', deliveryNoteController.deleteDeliveryNote);

export default router;
