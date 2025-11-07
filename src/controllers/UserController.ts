import { Response } from 'express';
import { RequestWithUser, UserUpdateSchema } from '../types';
import { UserModel } from '../models/UserModel';
import { AuthUtils } from '../utils/auth';

export class UserController {
  static async getAll(_req: RequestWithUser, res: Response): Promise<void> {
    try {
      const users = await UserModel.findAll();
      res.json({ users });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user by id error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const { password, password_hash, ...rest } = userData;

      // Check if username or email already exists
      const existingUser = await UserModel.findByUsername(userData.username);
      if (existingUser) {
        res.status(400).json({ error: 'Username already exists' });
        return;
      }

      const existingEmail = await UserModel.findByEmail(userData.email);
      if (existingEmail) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }

      // Hash password (accept either password or password_hash)
      let hashedPassword: string;
      if (password) {
        hashedPassword = await AuthUtils.hashPassword(password);
      } else if (password_hash) {
        hashedPassword = password_hash;
      } else {
        res.status(400).json({ error: 'Password is required' });
        return;
      }

      const newUser = await UserModel.create({
        ...rest,
        password_hash: hashedPassword,
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role_id: newUser.role_id,
        },
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = UserUpdateSchema.parse(req.body);

      // If password is being updated, hash it
      if (updateData.password_hash) {
        updateData.password_hash = await AuthUtils.hashPassword(updateData.password_hash);
      }
      
      // Also handle 'password' field if provided
      if ((req.body as any).password) {
        updateData.password_hash = await AuthUtils.hashPassword((req.body as any).password);
      }

      // Check if username or email already exists (if being updated)
      if (updateData.username) {
        const existingUser = await UserModel.findByUsername(updateData.username);
        if (existingUser && existingUser.id !== id) {
          res.status(400).json({ error: 'Username already exists' });
          return;
        }
      }

      if (updateData.email) {
        const existingEmail = await UserModel.findByEmail(updateData.email);
        if (existingEmail && existingEmail.id !== id) {
          res.status(400).json({ error: 'Email already exists' });
          return;
        }
      }

      const updatedUser = await UserModel.update(id, updateData);

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        message: 'User updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role_id: updatedUser.role_id,
        },
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async delete(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await UserModel.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

