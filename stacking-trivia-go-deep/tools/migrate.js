/**
 * Database migration runner
 * Executes SQL migration files against the PostgreSQL database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/database/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration(migrationFile) {
  try {
    console.log(`📄 Running migration: ${migrationFile}`);
    
    const migrationPath = path.join(__dirname, '../src/database/migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log(`✅ Migration completed: ${migrationFile}`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationFile}`, error.message);
    return false;
  }
}

async function runAllMigrations() {
  try {
    console.log('🔄 Starting database migrations...\n');
    
    const migrationsDir = path.join(__dirname, '../src/database/migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('📁 No migrations directory found, creating it...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      return;
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (migrationFiles.length === 0) {
      console.log('📭 No migration files found');
      return;
    }
    
    console.log(`🎯 Found ${migrationFiles.length} migrations to run:`);
    migrationFiles.forEach(file => console.log(`   • ${file}`));
    console.log('');
    
    let success = 0;
    let failed = 0;
    
    for (const file of migrationFiles) {
      const result = await runMigration(file);
      if (result) {
        success++;
      } else {
        failed++;
        // Continue with other migrations even if one fails
      }
    }
    
    console.log(`\n🎉 Migration summary:`);
    console.log(`   ✅ Successful: ${success}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total: ${migrationFiles.length}\n`);
    
    if (failed > 0) {
      console.log('⚠️  Some migrations failed. Check the errors above.');
      process.exit(1);
    } else {
      console.log('🎊 All migrations completed successfully!');
    }
    
  } catch (error) {
    console.error('💥 Migration runner failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// CLI usage
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🗃️  Database Migration Runner

Usage:
  node tools/migrate.js [migration-file]

Examples:
  # Run all migrations
  node tools/migrate.js
  
  # Run specific migration
  node tools/migrate.js 001_content_management.sql

Environment Variables:
  DATABASE_URL    PostgreSQL connection string (required)
`);
  process.exit(0);
}

// Run specific migration or all migrations
const specificMigration = process.argv[2];
if (specificMigration) {
  runMigration(specificMigration).then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  runAllMigrations();
}
