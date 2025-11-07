import { z } from 'zod';
import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

// Permission Group Types
export const PermissionGroupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type PermissionGroup = z.infer<typeof PermissionGroupSchema>;

// Permission Types
export const PermissionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  permission_group_id: z.string().uuid().optional().nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;

// Group Permission Mapping Types
export const GroupPermissionMappingSchema = z.object({
  id: z.string().uuid().optional(),
  permission_group_id: z.string().uuid(),
  permission_id: z.string().uuid(),
  created_at: z.date().optional(),
});

export type GroupPermissionMapping = z.infer<typeof GroupPermissionMappingSchema>;

// Role Types
export const RoleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type Role = z.infer<typeof RoleSchema>;

// Role Permission Types
export const RolePermissionSchema = z.object({
  id: z.string().uuid().optional(),
  role_id: z.string().uuid(),
  permission_id: z.string().uuid(),
  created_at: z.date().optional(),
});

export type RolePermission = z.infer<typeof RolePermissionSchema>;

// User Types
export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  username: z.string().min(3).max(255),
  email: z.string().email(),
  password_hash: z.string().min(1),
  role_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
  last_login: z.date().optional().nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// Schema for user registration (accepts password, not password_hash)
export const UserRegisterSchema = z.object({
  username: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  role_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true).optional(),
});

// Schema for creating user (internal use, accepts password_hash)
export const UserCreateSchema = UserSchema.omit({ id: true, created_at: true, updated_at: true, last_login: true });
export const UserUpdateSchema = UserSchema.partial().omit({ id: true, created_at: true });

export const UserLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type User = z.infer<typeof UserSchema>;
export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;

// Request with User
export type RequestWithUser<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = any> =
  Request<P, ResBody, ReqBody, ReqQuery> & { user?: User };

