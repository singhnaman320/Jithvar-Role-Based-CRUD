import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserLoginSchema, UserRegisterSchema } from '../types';

const router = Router();

router.post('/register', validate(UserRegisterSchema), AuthController.register);
router.post('/login', validate(UserLoginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.me);

export default router;

