import { Response } from 'express';
import { RequestWithUser, PermissionGroupSchema } from '../types';
import { PermissionGroupModel } from '../models/PermissionGroupModel';
import { GroupPermissionMappingModel } from '../models/GroupPermissionMappingModel';

export class PermissionGroupController {
  static async getAll(_req: RequestWithUser, res: Response): Promise<void> {
    try {
      const groups = await PermissionGroupModel.findAll();
      res.json({ groups });
    } catch (error) {
      console.error('Get all permission groups error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const group = await PermissionGroupModel.findById(id);

      if (!group) {
        res.status(404).json({ error: 'Permission group not found' });
        return;
      }

      // Get permissions for this group
      const permissions = await GroupPermissionMappingModel.findByGroupId(id);

      res.json({ group, permissions });
    } catch (error) {
      console.error('Get permission group by id error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const groupData = PermissionGroupSchema.omit({ id: true, created_at: true, updated_at: true }).parse(req.body);

      // Check if group name already exists
      const existingGroup = await PermissionGroupModel.findByName(groupData.name);
      if (existingGroup) {
        res.status(400).json({ error: 'Permission group name already exists' });
        return;
      }

      const newGroup = await PermissionGroupModel.create(groupData);
      res.status(201).json({
        message: 'Permission group created successfully',
        group: newGroup,
      });
    } catch (error) {
      console.error('Create permission group error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = PermissionGroupSchema.partial().omit({ id: true, created_at: true }).parse(req.body);

      // Check if group name already exists (if being updated)
      if (updateData.name) {
        const existingGroup = await PermissionGroupModel.findByName(updateData.name);
        if (existingGroup && existingGroup.id !== id) {
          res.status(400).json({ error: 'Permission group name already exists' });
          return;
        }
      }

      const updatedGroup = await PermissionGroupModel.update(id, updateData);

      if (!updatedGroup) {
        res.status(404).json({ error: 'Permission group not found' });
        return;
      }

      res.json({
        message: 'Permission group updated successfully',
        group: updatedGroup,
      });
    } catch (error) {
      console.error('Update permission group error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async delete(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await PermissionGroupModel.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Permission group not found' });
        return;
      }

      res.json({ message: 'Permission group deleted successfully' });
    } catch (error) {
      console.error('Delete permission group error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

