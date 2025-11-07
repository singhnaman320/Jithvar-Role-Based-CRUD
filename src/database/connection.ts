import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private pool: Pool;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in environment variables. Please check your .env file.');
    }

    // Check if DATABASE_URL looks valid
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      throw new Error('DATABASE_URL must start with postgresql:// or postgres://');
    }

    let sslConfig: boolean | { rejectUnauthorized: boolean } = false;
    
    if (process.env.DATABASE_SSL === 'true' || process.env.DATABASE_SSL === 'required') {
      sslConfig = { rejectUnauthorized: false };
    } else if (process.env.NODE_ENV === 'production') {
      sslConfig = { rejectUnauthorized: false };
    } else if (dbUrl.includes('.supabase.co') || 
               dbUrl.includes('.railway.app') || 
               dbUrl.includes('.render.com') ||
               dbUrl.includes('.neon.tech') ||
               dbUrl.includes('amazonaws.com') ||
               dbUrl.includes('azure.com')) {
      
      sslConfig = { rejectUnauthorized: false };
    }

    this.pool = new Pool({
      connectionString: dbUrl,
      ssl: sslConfig,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error', { text, error });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT NOW()');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

export const db = new Database();

