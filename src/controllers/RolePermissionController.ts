import { Response } from 'express';
import { RequestWithUser, RolePermissionSchema } from '../types';
import { RolePermissionModel } from '../models/RolePermissionModel';
import { RoleModel } from '../models/RoleModel';
import { PermissionModel } from '../models/PermissionModel';

export class RolePermissionController {
  static async getByRoleId(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const permissions = await RolePermissionModel.findByRoleId(roleId);
      res.json({ permissions });
    } catch (error) {
      console.error('Get role permissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const mappingData = RolePermissionSchema.omit({ id: true, created_at: true }).parse(req.body);

      // Verify role and permission exist
      const role = await RoleModel.findById(mappingData.role_id);
      if (!role) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      const permission = await PermissionModel.findById(mappingData.permission_id);
      if (!permission) {
        res.status(404).json({ error: 'Permission not found' });
        return;
      }

      const newMapping = await RolePermissionModel.create(mappingData);
      res.status(201).json({
        message: 'Role permission assigned successfully',
        rolePermission: newMapping,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation
        res.status(400).json({ error: 'Role permission already exists' });
        return;
      }
      console.error('Create role permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async delete(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { roleId, permissionId } = req.params;
      const deleted = await RolePermissionModel.delete(roleId, permissionId);

      if (!deleted) {
        res.status(404).json({ error: 'Role permission not found' });
        return;
      }

      res.json({ message: 'Role permission removed successfully' });
    } catch (error) {
      console.error('Delete role permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

