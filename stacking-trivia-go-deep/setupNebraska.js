/**
 * Manual database setup and Nebraska stack insertion
 * Run this to set up the database and add the epic Nebraska sports stack
 */

import fs from 'fs';
import { pool } from './src/database/postgres.js';

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database for Nebraska sports stack...\n');

    // Create a test user first
    console.log('👤 Creating admin user...');
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, total_score, games_played)
      VALUES ('admin', 'admin@nebraska-sports.com', '$2a$10$dummy.hash.for.testing', 0, 0)
      ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
      RETURNING id
    `);
    
    const userId = userResult.rows[0].id;
    console.log(`✅ User created/updated with ID: ${userId}`);

    // Grant admin role
    await pool.query(`
      INSERT INTO user_roles (user_id, role, permissions)
      VALUES ($1, 'admin', '["play_games", "create_stacks", "edit_all_stacks", "moderate_content"]'::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET 
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions
    `, [userId]);

    console.log('✅ Admin role granted');

    // Load and insert the epic Nebraska stack
    console.log('\n🏈 Loading Nebraska Sports Ultimate stack...');
    const nebraskaData = JSON.parse(fs.readFileSync('./nebraska-sports-ultimate.json', 'utf8'));
    
    // Create the stack
    const stackResult = await pool.query(`
      INSERT INTO stacks (
        slug, title, description, category, difficulty_level, 
        image_url, image_hint, tags, is_published, is_featured, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      'nebraska-sports-ultimate',
      nebraskaData.title,
      nebraskaData.description,
      nebraskaData.category,
      nebraskaData.difficulty_level,
      nebraskaData.image,
      nebraskaData.imageHint,
      JSON.stringify(nebraskaData.tags),
      true, // published
      true, // featured
      userId
    ]);

    const stackId = stackResult.rows[0].id;
    console.log(`✅ Stack created with ID: ${stackId}`);

    // Clear existing questions for this stack
    await pool.query('DELETE FROM questions WHERE stack_id = $1', [stackId]);

    // Insert all questions
    console.log(`📝 Inserting ${nebraskaData.questions.length} questions...`);
    
    for (const question of nebraskaData.questions) {
      await pool.query(`
        INSERT INTO questions (
          stack_id, level, question_text, correct_answer, 
          alternative_answers, hint, explanation, difficulty_modifier
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        stackId,
        question.level,
        question.question,
        question.answer,
        JSON.stringify(question.alternative_answers || []),
        question.hint || null,
        question.explanation || null,
        1.0
      ]);
    }

    console.log(`✅ All ${nebraskaData.questions.length} questions inserted!`);

    // Verify the insertion
    const verification = await pool.query(`
      SELECT s.title, s.description, COUNT(q.id) as question_count
      FROM stacks s
      LEFT JOIN questions q ON s.id = q.stack_id
      WHERE s.slug = 'nebraska-sports-ultimate'
      GROUP BY s.id, s.title, s.description
    `);

    if (verification.rows.length > 0) {
      const stack = verification.rows[0];
      console.log(`\n🎉 SUCCESS! Nebraska Sports Stack Created:`);
      console.log(`   📚 Title: ${stack.title}`);
      console.log(`   📝 Questions: ${stack.question_count}`);
      console.log(`   🎯 Ready to play!\n`);

      // Show API endpoints to access it
      console.log(`🔗 Access your stack via API:`);
      console.log(`   GET  /api/stacks/nebraska-sports-ultimate`);
      console.log(`   POST /api/stacks (to create more stacks)`);
      console.log(`   GET  /api/stacks (to list all stacks)\n`);

      console.log(`🎮 Your family can now play the ultimate 35-question`);
      console.log(`   Nebraska sports challenge covering:`);
      console.log(`   🏈 Football legends and championships`);
      console.log(`   🏐 Volleyball dominance and records`);
      console.log(`   🏟️ Memorial Stadium history and traditions`);
      console.log(`   📊 Statistics and memorable moments\n`);

    } else {
      console.log('❌ Verification failed - stack not found');
    }

  } catch (error) {
    console.error('💥 Database setup failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your DATABASE_URL is set correctly');
    console.log('2. Ensure the database server is running');
    console.log('3. Check that all required tables exist');
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();
