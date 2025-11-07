import { db } from '../database/connection';
import { Role } from '../types';

export class RoleModel {
  static async findAll(): Promise<Role[]> {
    const result = await db.query('SELECT * FROM tbl_role ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id: string): Promise<Role | null> {
    const result = await db.query('SELECT * FROM tbl_role WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByName(name: string): Promise<Role | null> {
    const result = await db.query('SELECT * FROM tbl_role WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  static async create(roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> {
    const { name, description, is_active } = roleData;
    const result = await db.query(`
      INSERT INTO tbl_role (name, description, is_active)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description || null, is_active ?? true]);
    return result.rows[0];
  }

  static async update(id: string, roleData: Partial<Omit<Role, 'id' | 'created_at'>>): Promise<Role | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(roleData).forEach(([key, value]) => {
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
      UPDATE tbl_role
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.query('DELETE FROM tbl_role WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

