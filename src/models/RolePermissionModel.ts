import { db } from '../database/connection';
import { RolePermission } from '../types';

export class RolePermissionModel {
  static async findByRoleId(roleId: string): Promise<RolePermission[]> {
    const result = await db.query(`
      SELECT rp.*, p.name as permission_name
      FROM tbl_role_permissions rp
      JOIN tbl_permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1
    `, [roleId]);
    return result.rows;
  }

  static async findByPermissionId(permissionId: string): Promise<RolePermission[]> {
    const result = await db.query(`
      SELECT rp.*, r.name as role_name
      FROM tbl_role_permissions rp
      JOIN tbl_role r ON rp.role_id = r.id
      WHERE rp.permission_id = $1
    `, [permissionId]);
    return result.rows;
  }

  static async create(rolePermissionData: Omit<RolePermission, 'id' | 'created_at'>): Promise<RolePermission> {
    const { role_id, permission_id } = rolePermissionData;
    const result = await db.query(`
      INSERT INTO tbl_role_permissions (role_id, permission_id)
      VALUES ($1, $2)
      RETURNING *
    `, [role_id, permission_id]);
    return result.rows[0];
  }

  static async delete(roleId: string, permissionId: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM tbl_role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permissionId]
    );
    return result.rowCount > 0;
  }

  static async deleteByRoleId(roleId: string): Promise<boolean> {
    const result = await db.query('DELETE FROM tbl_role_permissions WHERE role_id = $1', [roleId]);
    return result.rowCount > 0;
  }
}

