import { Response } from 'express';
import { RequestWithUser, GroupPermissionMappingSchema } from '../types';
import { GroupPermissionMappingModel } from '../models/GroupPermissionMappingModel';
import { PermissionGroupModel } from '../models/PermissionGroupModel';
import { PermissionModel } from '../models/PermissionModel';

export class GroupPermissionMappingController {
  static async getByGroupId(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const mappings = await GroupPermissionMappingModel.findByGroupId(groupId);
      res.json({ mappings });
    } catch (error) {
      console.error('Get group permission mappings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const mappingData = GroupPermissionMappingSchema.omit({ id: true, created_at: true }).parse(req.body);

      // Verify group and permission exist
      const group = await PermissionGroupModel.findById(mappingData.permission_group_id);
      if (!group) {
        res.status(404).json({ error: 'Permission group not found' });
        return;
      }

      const permission = await PermissionModel.findById(mappingData.permission_id);
      if (!permission) {
        res.status(404).json({ error: 'Permission not found' });
        return;
      }

      const newMapping = await GroupPermissionMappingModel.create(mappingData);
      res.status(201).json({
        message: 'Group permission mapping created successfully',
        mapping: newMapping,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation
        res.status(400).json({ error: 'Group permission mapping already exists' });
        return;
      }
      console.error('Create group permission mapping error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async delete(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { groupId, permissionId } = req.params;
      const deleted = await GroupPermissionMappingModel.delete(groupId, permissionId);

      if (!deleted) {
        res.status(404).json({ error: 'Group permission mapping not found' });
        return;
      }

      res.json({ message: 'Group permission mapping removed successfully' });
    } catch (error) {
      console.error('Delete group permission mapping error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

