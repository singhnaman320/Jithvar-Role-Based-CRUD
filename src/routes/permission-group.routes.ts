import { Router } from 'express';
import { PermissionGroupController } from '../controllers/PermissionGroupController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { PermissionGroupSchema } from '../types';

const router = Router();

router.use(requireAuth);

router.get('/', PermissionGroupController.getAll);
router.get('/:id', PermissionGroupController.getById);
router.post('/', validate(PermissionGroupSchema.omit({ id: true, created_at: true, updated_at: true })), PermissionGroupController.create);
router.put('/:id', validate(PermissionGroupSchema.partial().omit({ id: true, created_at: true })), PermissionGroupController.update);
router.delete('/:id', PermissionGroupController.delete);

export default router;

