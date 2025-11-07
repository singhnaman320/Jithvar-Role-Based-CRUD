import { db } from '../database/connection';
import { User, UserCreate, UserUpdate } from '../types';

export class UserModel {
  static async findAll(): Promise<User[]> {
    const result = await db.query(`
      SELECT u.*, r.name as role_name
      FROM tbl_users u
      LEFT JOIN tbl_role r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    return result.rows;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await db.query(`
      SELECT u.*, r.name as role_name
      FROM tbl_users u
      LEFT JOIN tbl_role r ON u.role_id = r.id
      WHERE u.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await db.query(`
      SELECT u.*, r.name as role_name
      FROM tbl_users u
      LEFT JOIN tbl_role r ON u.role_id = r.id
      WHERE u.username = $1
    `, [username]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await db.query(`
      SELECT u.*, r.name as role_name
      FROM tbl_users u
      LEFT JOIN tbl_role r ON u.role_id = r.id
      WHERE u.email = $1
    `, [email]);
    return result.rows[0] || null;
  }

  static async create(userData: UserCreate): Promise<User> {
    const { username, email, password_hash, role_id, is_active } = userData;
    const result = await db.query(`
      INSERT INTO tbl_users (username, email, password_hash, role_id, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [username, email, password_hash, role_id || null, is_active ?? true]);
    return result.rows[0];
  }

  static async update(id: string, userData: UserUpdate): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(userData).forEach(([key, value]) => {
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
      UPDATE tbl_users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.query('DELETE FROM tbl_users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async updateLastLogin(id: string): Promise<void> {
    await db.query('UPDATE tbl_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  }
}

