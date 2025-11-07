import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from './connection';

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Read schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Remove SQL line comments (starting with --) before splitting
    const schemaWithoutComments = schema
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n');
    
    // Split SQL statements by semicolon and filter out empty ones
    const statements = schemaWithoutComments
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);
    
    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await db.query(statement + ';');
        console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
      } catch (error: any) {
        // Ignore "already exists" errors for extensions and tables
        if (error.code === '42P07' || error.code === '42710') {
          console.log(`⚠ Statement ${i + 1} already exists, skipping...`);
        } else {
          console.error(`✗ Error in statement ${i + 1}:`, statement.substring(0, 100));
          throw error;
        }
      }
    }
    
    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

