import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { PermissionSchema } from '../types';

const router = Router();

router.use(requireAuth);

router.get('/', PermissionController.getAll);
router.get('/:id', PermissionController.getById);
router.post('/', validate(PermissionSchema.omit({ id: true, created_at: true, updated_at: true })), PermissionController.create);
router.put('/:id', validate(PermissionSchema.partial().omit({ id: true, created_at: true })), PermissionController.update);
router.delete('/:id', PermissionController.delete);

export default router;

