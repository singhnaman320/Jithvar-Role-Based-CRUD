import { Response } from 'express';
import { RequestWithUser, RoleSchema } from '../types';
import { RoleModel } from '../models/RoleModel';
import { RolePermissionModel } from '../models/RolePermissionModel';

export class RoleController {
  static async getAll(_req: RequestWithUser, res: Response): Promise<void> {
    try {
      const roles = await RoleModel.findAll();
      res.json({ roles });
    } catch (error) {
      console.error('Get all roles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const role = await RoleModel.findById(id);

      if (!role) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      // Get permissions for this role
      const permissions = await RolePermissionModel.findByRoleId(id);

      res.json({ role, permissions });
    } catch (error) {
      console.error('Get role by id error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const roleData = RoleSchema.omit({ id: true, created_at: true, updated_at: true }).parse(req.body);

      // Check if role name already exists
      const existingRole = await RoleModel.findByName(roleData.name);
      if (existingRole) {
        res.status(400).json({ error: 'Role name already exists' });
        return;
      }

      const newRole = await RoleModel.create(roleData);
      res.status(201).json({
        message: 'Role created successfully',
        role: newRole,
      });
    } catch (error) {
      console.error('Create role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = RoleSchema.partial().omit({ id: true, created_at: true }).parse(req.body);

      // Check if role name already exists (if being updated)
      if (updateData.name) {
        const existingRole = await RoleModel.findByName(updateData.name);
        if (existingRole && existingRole.id !== id) {
          res.status(400).json({ error: 'Role name already exists' });
          return;
        }
      }

      const updatedRole = await RoleModel.update(id, updateData);

      if (!updatedRole) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      res.json({
        message: 'Role updated successfully',
        role: updatedRole,
      });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async delete(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await RoleModel.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      console.error('Delete role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

