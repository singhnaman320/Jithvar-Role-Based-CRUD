import { db } from '../database/connection';
import { Permission } from '../types';

export class PermissionModel {
  static async findAll(): Promise<Permission[]> {
    const result = await db.query(`
      SELECT p.*, pg.name as permission_group_name
      FROM tbl_permissions p
      LEFT JOIN tbl_permission_groups pg ON p.permission_group_id = pg.id
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  }

  static async findById(id: string): Promise<Permission | null> {
    const result = await db.query(`
      SELECT p.*, pg.name as permission_group_name
      FROM tbl_permissions p
      LEFT JOIN tbl_permission_groups pg ON p.permission_group_id = pg.id
      WHERE p.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async findByName(name: string): Promise<Permission | null> {
    const result = await db.query('SELECT * FROM tbl_permissions WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  static async create(permissionData: Omit<Permission, 'id' | 'created_at' | 'updated_at'>): Promise<Permission> {
    const { name, description, permission_group_id } = permissionData;
    const result = await db.query(`
      INSERT INTO tbl_permissions (name, description, permission_group_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description || null, permission_group_id || null]);
    return result.rows[0];
  }

  static async update(id: string, permissionData: Partial<Omit<Permission, 'id' | 'created_at'>>): Promise<Permission | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(permissionData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(`
      UPDATE tbl_permissions
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.query('DELETE FROM tbl_permissions WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

