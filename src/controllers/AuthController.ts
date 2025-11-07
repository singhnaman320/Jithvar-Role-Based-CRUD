import { Request, Response } from 'express';
import { RequestWithUser } from '../types';
import { UserModel } from '../models/UserModel';
import { AuthUtils } from '../utils/auth';
import { UserLoginSchema, UserRegisterSchema } from '../types';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = UserLoginSchema.parse(req.body);

      const user = await UserModel.findByUsername(username);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      if (!user.is_active) {
        res.status(403).json({ error: 'Account is inactive' });
        return;
      }

      const isValidPassword = await AuthUtils.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Set session
      req.session!.userId = user.id;
      req.session!.username = user.username;

      // Update last login
      await UserModel.updateLastLogin(user.id!);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role_id: user.role_id,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const sessionName = process.env.SESSION_NAME || 'rbac_session';
    req.session?.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        res.status(500).json({ error: 'Failed to logout' });
        return;
      }
      res.clearCookie(sessionName);
      res.json({ message: 'Logout successful' });
    });
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = UserRegisterSchema.parse(req.body);
      const { password, is_active, ...rest } = userData;

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

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(password);

      // Create user
      const newUser = await UserModel.create({
        ...rest,
        is_active: is_active ?? true,
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
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async me(req: RequestWithUser, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await UserModel.findById(req.user.id!);
      res.json({
        user: {
          id: user?.id,
          username: user?.username,
          email: user?.email,
          role_id: user?.role_id,
          is_active: user?.is_active,
          last_login: user?.last_login,
        },
      });
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

