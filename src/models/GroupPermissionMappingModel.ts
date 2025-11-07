import { db } from '../database/connection';
import { GroupPermissionMapping } from '../types';

export class GroupPermissionMappingModel {
  static async findByGroupId(groupId: string): Promise<GroupPermissionMapping[]> {
    const result = await db.query(`
      SELECT gpm.*, p.name as permission_name
      FROM tbl_group_permission_mapping gpm
      JOIN tbl_permissions p ON gpm.permission_id = p.id
      WHERE gpm.permission_group_id = $1
    `, [groupId]);
    return result.rows;
  }

  static async findByPermissionId(permissionId: string): Promise<GroupPermissionMapping[]> {
    const result = await db.query(`
      SELECT gpm.*, pg.name as permission_group_name
      FROM tbl_group_permission_mapping gpm
      JOIN tbl_permission_groups pg ON gpm.permission_group_id = pg.id
      WHERE gpm.permission_id = $1
    `, [permissionId]);
    return result.rows;
  }

  static async create(mappingData: Omit<GroupPermissionMapping, 'id' | 'created_at'>): Promise<GroupPermissionMapping> {
    const { permission_group_id, permission_id } = mappingData;
    const result = await db.query(`
      INSERT INTO tbl_group_permission_mapping (permission_group_id, permission_id)
      VALUES ($1, $2)
      RETURNING *
    `, [permission_group_id, permission_id]);
    return result.rows[0];
  }

  static async delete(groupId: string, permissionId: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM tbl_group_permission_mapping WHERE permission_group_id = $1 AND permission_id = $2',
      [groupId, permissionId]
    );
    return result.rowCount > 0;
  }

  static async deleteByGroupId(groupId: string): Promise<boolean> {
    const result = await db.query('DELETE FROM tbl_group_permission_mapping WHERE permission_group_id = $1', [groupId]);
    return result.rowCount > 0;
  }
}

