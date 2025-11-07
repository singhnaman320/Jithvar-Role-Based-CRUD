import { Response } from 'express';
import { RequestWithUser, PermissionSchema } from '../types';
import { PermissionModel } from '../models/PermissionModel';

export class PermissionController {
  static async getAll(_req: RequestWithUser, res: Response): Promise<void> {
    try {
      const permissions = await PermissionModel.findAll();
      res.json({ permissions });
    } catch (error) {
      console.error('Get all permissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const permission = await PermissionModel.findById(id);

      if (!permission) {
        res.status(404).json({ error: 'Permission not found' });
        return;
      }

      res.json({ permission });
    } catch (error) {
      console.error('Get permission by id error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const permissionData = PermissionSchema.omit({ id: true, created_at: true, updated_at: true }).parse(req.body);

      // Check if permission name already exists
      const existingPermission = await PermissionModel.findByName(permissionData.name);
      if (existingPermission) {
        res.status(400).json({ error: 'Permission name already exists' });
        return;
      }

      const newPermission = await PermissionModel.create(permissionData);
      res.status(201).json({
        message: 'Permission created successfully',
        permission: newPermission,
      });
    } catch (error) {
      console.error('Create permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = PermissionSchema.partial().omit({ id: true, created_at: true }).parse(req.body);

      // Check if permission name already exists (if being updated)
      if (updateData.name) {
        const existingPermission = await PermissionModel.findByName(updateData.name);
        if (existingPermission && existingPermission.id !== id) {
          res.status(400).json({ error: 'Permission name already exists' });
          return;
        }
      }

      const updatedPermission = await PermissionModel.update(id, updateData);

      if (!updatedPermission) {
        res.status(404).json({ error: 'Permission not found' });
        return;
      }

      res.json({
        message: 'Permission updated successfully',
        permission: updatedPermission,
      });
    } catch (error) {
      console.error('Update permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async delete(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await PermissionModel.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Permission not found' });
        return;
      }

      res.json({ message: 'Permission deleted successfully' });
    } catch (error) {
      console.error('Delete permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

