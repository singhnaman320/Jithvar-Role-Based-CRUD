import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types';
import { UserModel } from '../models/UserModel';
import { db } from '../database/connection';

export interface SessionData {
  userId?: string;
  username?: string;
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

export const requireAuth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.session || !req.session.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await UserModel.findById(req.session.userId);
    if (!user || !user.is_active) {
      req.session.destroy(() => {});
      res.status(401).json({ error: 'Invalid or inactive user' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requirePermission = (permissionName: string) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.role_id) {
        res.status(403).json({ error: 'Access denied: No role assigned' });
        return;
      }

      // Check if user's role has the required permission
      const result = await db.query(`
        SELECT COUNT(*) as count
        FROM tbl_role_permissions rp
        JOIN tbl_permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = $1 AND p.name = $2
      `, [req.user.role_id, permissionName]);

      if (parseInt(result.rows[0].count) === 0) {
        res.status(403).json({ error: `Access denied: Permission '${permissionName}' required` });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

