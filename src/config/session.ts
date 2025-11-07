import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const PgSession = connectPgSimple(session);

const dbUrl = process.env.DATABASE_URL as string;

let sslConfig: boolean | { rejectUnauthorized: boolean } = false;
if (process.env.DATABASE_SSL === 'true' || process.env.DATABASE_SSL === 'required') {
  sslConfig = { rejectUnauthorized: false };
} else if (process.env.NODE_ENV === 'production') {
  sslConfig = { rejectUnauthorized: false };
} else if (dbUrl && (
  dbUrl.includes('.supabase.co') ||
  dbUrl.includes('.railway.app') ||
  dbUrl.includes('.render.com') ||
  dbUrl.includes('.neon.tech') ||
  dbUrl.includes('amazonaws.com') ||
  dbUrl.includes('azure.com')
)) {
  sslConfig = { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: sslConfig,
});

export const sessionConfig = session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: process.env.SESSION_NAME || 'rbac_session',
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    httpOnly: process.env.COOKIE_HTTP_ONLY !== 'false',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
  },
});

