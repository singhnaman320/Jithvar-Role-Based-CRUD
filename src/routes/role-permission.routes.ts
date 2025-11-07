import { Router } from 'express';
import { RolePermissionController } from '../controllers/RolePermissionController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { RolePermissionSchema } from '../types';

const router = Router();

router.use(requireAuth);

router.get('/:roleId/permissions', RolePermissionController.getByRoleId);
router.post('/', validate(RolePermissionSchema.omit({ id: true, created_at: true })), RolePermissionController.create);
router.delete('/:roleId/:permissionId', RolePermissionController.delete);

export default router;

