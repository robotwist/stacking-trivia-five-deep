#!/usr/bin/env node

// Database connection test script
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:password@localhost:5432/stacking_trivia';

console.log('🔍 Testing database connection...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Check if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    
    console.log('📋 Current tables:', tablesResult.rows.map(row => row.table_name));
    
    // Create the users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        total_score INTEGER DEFAULT 0,
        games_played INTEGER DEFAULT 0,
        best_single_stack INTEGER DEFAULT 0,
        achievements JSONB DEFAULT '[]'::jsonb,
        completed_stacks JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Users table created/verified');
    
    // Check tables again
    const tablesAfter = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    
    console.log('📋 Tables after setup:', tablesAfter.rows.map(row => row.table_name));
    
    client.release();
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testConnection();
