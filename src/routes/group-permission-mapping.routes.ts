import { Router } from 'express';
import { GroupPermissionMappingController } from '../controllers/GroupPermissionMappingController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { GroupPermissionMappingSchema } from '../types';

const router = Router();

router.use(requireAuth);

router.get('/:groupId/permissions', GroupPermissionMappingController.getByGroupId);
router.post('/', validate(GroupPermissionMappingSchema.omit({ id: true, created_at: true })), GroupPermissionMappingController.create);
router.delete('/:groupId/:permissionId', GroupPermissionMappingController.delete);

export default router;

