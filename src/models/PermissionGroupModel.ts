import { db } from '../database/connection';
import { PermissionGroup } from '../types';

export class PermissionGroupModel {
  static async findAll(): Promise<PermissionGroup[]> {
    const result = await db.query('SELECT * FROM tbl_permission_groups ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id: string): Promise<PermissionGroup | null> {
    const result = await db.query('SELECT * FROM tbl_permission_groups WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByName(name: string): Promise<PermissionGroup | null> {
    const result = await db.query('SELECT * FROM tbl_permission_groups WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  static async create(groupData: Omit<PermissionGroup, 'id' | 'created_at' | 'updated_at'>): Promise<PermissionGroup> {
    const { name, description } = groupData;
    const result = await db.query(`
      INSERT INTO tbl_permission_groups (name, description)
      VALUES ($1, $2)
      RETURNING *
    `, [name, description || null]);
    return result.rows[0];
  }

  static async update(id: string, groupData: Partial<Omit<PermissionGroup, 'id' | 'created_at'>>): Promise<PermissionGroup | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(groupData).forEach(([key, value]) => {
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
      UPDATE tbl_permission_groups
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.query('DELETE FROM tbl_permission_groups WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

