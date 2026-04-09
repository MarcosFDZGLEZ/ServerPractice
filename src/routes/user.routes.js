import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.js';
import { uploadLogo } from '../middleware/upload.js';
import * as schemas from '../validators/user.validator.js';

const router = Router();

// Públicas
router.post('/register', validate(schemas.registerSchema), userController.register);
router.post('/login', validate(schemas.loginSchema), userController.login);
router.post('/refresh', userController.refreshToken);

// Protegidas (JWT)
router.use(protect); 

router.put('/validation', validate(schemas.validationSchema), userController.validateEmail);
router.get('/', userController.getMe);
router.put('/onboarding', validate(schemas.onboardingSchema), userController.updatePersonalData);
router.patch('/company', validate(schemas.companySchema), userController.updateCompanyData);
router.patch('/logo', uploadLogo.single('logo'), userController.uploadCompanyLogo);
router.delete('/', userController.deleteUser);
router.post('/logout', userController.logout);
router.delete('/', userController.deleteUser);

// Solo Admin
router.post('/invite', restrictTo('admin'), userController.inviteUser);

export default router;