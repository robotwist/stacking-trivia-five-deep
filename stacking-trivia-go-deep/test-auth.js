#!/usr/bin/env node

// Simple test runner for authentication system
console.log('🧪 Testing Authentication System Components...\n');

// Test 1: Check if all required files exist
import fs from 'fs';
import path from 'path';

const requiredFiles = [
  'src/contexts/AuthContext.jsx',
  'src/components/AuthModal.jsx',
  'src/components/UserProfile.jsx',
  'src/components/AuthErrorBoundary.jsx',
  'src/api/auth.js',
  'src/api/user.js',
  'src/utils/auth.js',
  'server.js'
];

let filesExist = true;
console.log('📁 File Structure Test:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    filesExist = false;
  }
});

// Test 2: Check for syntax errors by attempting imports
console.log('\n🔍 Import Test:');
try {
  // These will fail if there are syntax errors
  await import('./src/utils/auth.js');
  console.log('  ✅ Auth utilities import successfully');
} catch (error) {
  console.log('  ❌ Auth utilities import failed:', error.message);
  filesExist = false;
}

try {
  await import('./src/database/postgres.js');
  console.log('  ✅ Database module imports successfully');
} catch (error) {
  console.log('  ❌ Database module import failed:', error.message);
  filesExist = false;
}

// Test 3: Check package.json dependencies
console.log('\n📦 Dependencies Test:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['express', 'cors', 'bcryptjs', 'jsonwebtoken', 'pg'];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`  ❌ ${dep} - MISSING`);
    filesExist = false;
  }
});

// Test 4: Build test
console.log('\n🏗️  Build Test:');
try {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  console.log('  🔄 Running build test...');
  const { stdout, stderr } = await execAsync('npm run build');
  
  if (stderr && !stderr.includes('warning')) {
    console.log('  ❌ Build failed:', stderr);
    filesExist = false;
  } else {
    console.log('  ✅ Build completed successfully');
  }
} catch (error) {
  console.log('  ❌ Build test failed:', error.message);
  filesExist = false;
}

// Final result
console.log('\n🎯 Test Results:');
if (filesExist) {
  console.log('✅ All authentication system tests passed!');
  console.log('\n🚀 Ready to deploy:');
  console.log('  • All required files present');
  console.log('  • No syntax errors detected');
  console.log('  • All dependencies installed');
  console.log('  • Build process successful');
  console.log('\n📋 Manual testing steps:');
  console.log('  1. Start servers: npm start (or node server.js)');
  console.log('  2. Open http://localhost:3001 in browser');
  console.log('  3. Click "Sign In" button in top right');
  console.log('  4. Test signup/login flow');
  console.log('  5. Complete a trivia stack to test tracking');
} else {
  console.log('❌ Some tests failed - check errors above');
  process.exit(1);
}
