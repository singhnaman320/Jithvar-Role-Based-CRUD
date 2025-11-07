import { Router } from 'express';
import { RoleController } from '../controllers/RoleController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { RoleSchema } from '../types';

const router = Router();

router.use(requireAuth);

router.get('/', RoleController.getAll);
router.get('/:id', RoleController.getById);
router.post('/', validate(RoleSchema.omit({ id: true, created_at: true, updated_at: true })), RoleController.create);
router.put('/:id', validate(RoleSchema.partial().omit({ id: true, created_at: true })), RoleController.update);
router.delete('/:id', RoleController.delete);

export default router;

