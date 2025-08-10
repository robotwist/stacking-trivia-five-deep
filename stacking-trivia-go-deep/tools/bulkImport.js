#!/usr/bin/env node

/**
 * Bulk JSON Import Tool
 * Imports all existing JSON trivia files into the database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API endpoint configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // You'll need to get this from login

// Category mapping for existing files
const CATEGORY_MAPPING = {
  'van-gogh': 'arts-culture',
  'the_beatles': 'arts-culture',
  'frida-kahlo': 'arts-culture',
  'miles-davis': 'arts-culture',
  'shakespeare': 'arts-culture',
  'leonardo-da-vinci': 'arts-culture',
  'mozart': 'arts-culture',
  
  'olympic_distance_current': 'sports',
  'olympic_distance_1980s': 'sports',
  'nebraska_sports': 'sports',
  'muhammad-ali': 'sports',
  'michael-jordan': 'sports',
  'serena-williams': 'sports',
  
  'tesla': 'science-technology',
  'darwin': 'science-technology',
  'nasa': 'science-technology',
  'marie-curie': 'science-technology',
  'steve-jobs': 'science-technology',
  
  'blade_runner': 'cinema',
  'the-godfather': 'cinema',
  'star-wars': 'cinema',
  
  'ancient_greece': 'history',
  'cleopatra': 'history',
  'einstein': 'history',
  
  'van-gogh-myths': 'actually',
  'einstein-myths': 'actually',
  'shakespeare-myths': 'actually',
  
  'how-i-met-your-mother': 'pop-culture',
  'community': 'pop-culture',
  'the-goonies': 'pop-culture',
  'the-office': 'pop-culture',
  'friends': 'pop-culture',
  'back-to-the-future': 'pop-culture',
  'stranger-things': 'pop-culture',
  
  'dinosaurs': 'kids-zone',
  'superheroes': 'kids-zone',
  'space': 'kids-zone',
  'videogames': 'kids-zone',
  'animals': 'kids-zone',
  
  'heroes-journey-super': 'super-stacks',
  'jesus-historical-mythic': 'super-stacks',
  'philip-k-dick-super': 'super-stacks',
  'character-name-origins': 'super-stacks'
};

async function findAllJsonFiles() {
  const jsonFiles = [];
  const rootDir = path.join(__dirname, '..');
  
  // Search patterns
  const searchDirs = [
    rootDir, // Root level files
    path.join(rootDir, 'src/data'),
    path.join(rootDir, 'src/data/categories'),
    path.join(rootDir, 'src/data/stacks'),
    path.join(rootDir, 'src/stacks'),
  ];
  
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (item.endsWith('.json') && !item.includes('package') && !item.includes('routes')) {
        jsonFiles.push(fullPath);
      }
    }
  }
  
  // Scan all directories
  searchDirs.forEach(scanDirectory);
  
  // Also check for files in project root
  const rootFiles = fs.readdirSync(rootDir)
    .filter(file => file.endsWith('.json') && !file.includes('package'))
    .map(file => path.join(rootDir, file));
  
  jsonFiles.push(...rootFiles);
  
  return [...new Set(jsonFiles)]; // Remove duplicates
}

function parseJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Extract filename without extension for key
    const filename = path.basename(filePath, '.json');
    const key = filename.toLowerCase().replace(/[_\s]+/g, '-');
    
    // Determine category
    const category = CATEGORY_MAPPING[key] || 'general';
    
    // Standardize question format
    let questions = [];
    
    if (Array.isArray(data.questions)) {
      questions = data.questions.map((q, index) => {
        // Handle different question formats
        const questionText = q.question || q.q || '';
        let correctAnswer, alternativeAnswers = [];
        
        if (Array.isArray(q.answer)) {
          correctAnswer = q.answer[0];
          alternativeAnswers = q.answer.slice(1);
        } else if (Array.isArray(q.a)) {
          correctAnswer = q.a[0];
          alternativeAnswers = q.a.slice(1);
        } else {
          correctAnswer = q.answer || q.a || '';
        }
        
        return {
          level: q.level || index + 1,
          question_text: questionText,
          correct_answer: correctAnswer,
          alternative_answers: alternativeAnswers,
          question_type: 'text',
          hint: q.hint || '',
          explanation: q.explanation || '',
          difficulty_modifier: 1.0
        };
      });
    }
    
    return {
      title: data.title || filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: data.description || `Deep dive trivia about ${data.title || filename}`,
      category,
      difficulty_level: data.difficulty_level || 1,
      image_url: data.image || data.image_url || '',
      image_hint: data.imageHint || data.image_hint || '',
      tags: data.tags || [],
      questions,
      is_published: true,
      source_file: filePath
    };
  } catch (error) {
    console.error(`Failed to parse ${filePath}:`, error.message);
    return null;
  }
}

async function uploadStack(stackData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify(stackData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

async function bulkImport() {
  if (!ADMIN_TOKEN) {
    console.error('❌ ADMIN_TOKEN environment variable required');
    console.log('Get your token by logging in to the app and copying from localStorage');
    process.exit(1);
  }
  
  console.log('🔍 Scanning for JSON trivia files...\n');
  
  const jsonFiles = await findAllJsonFiles();
  console.log(`📁 Found ${jsonFiles.length} JSON files`);
  
  const stacks = [];
  const errors = [];
  
  // Parse all files
  for (const file of jsonFiles) {
    console.log(`📄 Parsing: ${path.relative(process.cwd(), file)}`);
    const stackData = parseJsonFile(file);
    
    if (stackData) {
      if (stackData.questions.length > 0) {
        stacks.push(stackData);
        console.log(`   ✅ ${stackData.title} (${stackData.questions.length} questions)`);
      } else {
        errors.push({ file, error: 'No valid questions found' });
        console.log(`   ⚠️  ${stackData.title} - No questions found`);
      }
    } else {
      errors.push({ file, error: 'Failed to parse JSON' });
    }
  }
  
  console.log(`\n📊 Ready to import:`);
  console.log(`   ✅ ${stacks.length} valid stacks`);
  console.log(`   ❌ ${errors.length} files with errors\n`);
  
  if (errors.length > 0) {
    console.log('⚠️  Files with errors:');
    errors.forEach(({ file, error }) => {
      console.log(`   • ${path.relative(process.cwd(), file)} - ${error}`);
    });
    console.log('');
  }
  
  // Group by category
  const byCategory = {};
  stacks.forEach(stack => {
    if (!byCategory[stack.category]) byCategory[stack.category] = [];
    byCategory[stack.category].push(stack);
  });
  
  console.log('📋 Import summary by category:');
  Object.entries(byCategory).forEach(([category, categoryStacks]) => {
    console.log(`   ${category}: ${categoryStacks.length} stacks`);
  });
  
  // Confirm before upload
  console.log('\n❓ Proceed with import? (y/N)');
  
  // Simple confirmation (in a real script you'd use readline)
  const proceed = process.argv.includes('--confirm') || process.argv.includes('-y');
  
  if (!proceed) {
    console.log('Import cancelled. Run with --confirm or -y to proceed automatically.');
    return;
  }
  
  console.log('\n🚀 Starting bulk import...\n');
  
  const results = [];
  let imported = 0;
  let failed = 0;
  
  for (const stack of stacks) {
    try {
      const result = await uploadStack(stack);
      results.push({ ...result, status: 'success' });
      imported++;
      console.log(`✅ ${stack.title} - imported successfully`);
    } catch (error) {
      results.push({ title: stack.title, status: 'error', error: error.message });
      failed++;
      console.log(`❌ ${stack.title} - ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n🎉 Bulk import completed!`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total processed: ${stacks.length}\n`);
  
  // Save detailed results
  const reportPath = path.join(__dirname, 'import-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: { imported, failed, total: stacks.length },
    results,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  console.log(`📄 Detailed results saved to: ${reportPath}`);
}

// CLI usage help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🎯 Bulk JSON Import Tool

Usage:
  node tools/bulkImport.js [options]

Environment Variables:
  API_BASE_URL    Base URL for API (default: http://localhost:3001)
  ADMIN_TOKEN     JWT token for authentication (required)

Options:
  --confirm, -y   Proceed with import without confirmation
  --help, -h      Show this help message

Examples:
  # Check what would be imported
  node tools/bulkImport.js
  
  # Import with confirmation
  ADMIN_TOKEN=your_jwt_token node tools/bulkImport.js --confirm
  
  # Custom API URL
  API_BASE_URL=https://your-app.com ADMIN_TOKEN=token node tools/bulkImport.js -y
`);
  process.exit(0);
}

// Run the import
if (import.meta.url === `file://${process.argv[1]}`) {
  bulkImport().catch(error => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });
}
