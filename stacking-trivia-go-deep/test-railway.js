// Railway Backend Test Script
// Uses curl commands to test API endpoints

const BASE_URL = 'https://quizzical-cherry-production.up.railway.app';

const testEndpoints = [
  { method: 'GET', endpoint: '/api/health', desc: 'Health Check' },
  { method: 'GET', endpoint: '/api/db-health', desc: 'Database Health' },
  { method: 'GET', endpoint: '/api/game/leaderboard', desc: 'Leaderboard (No Auth)' },
];

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testEndpoint(method, endpoint, desc, body = null) {
  console.log(`\n🧪 Testing: ${desc}`);
  console.log(`   ${method} ${BASE_URL}${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Railway-Test-Script',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(BASE_URL + endpoint, options);
    const contentType = response.headers.get('Content-Type');
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    } else {
      const text = await response.text();
      const preview = text.substring(0, 200).replace(/\s+/g, ' ');
      console.log(`   Response Preview: ${preview}...`);
      
      // Check if it's the HTML frontend being served instead of API
      if (text.includes('<html') && text.includes('Deeply Trivial')) {
        console.log(`   ⚠️  ISSUE: Frontend HTML served instead of API response!`);
      }
    }
    
    return { success: response.ok, status: response.status, contentType };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Railway Backend API Test Suite');
  console.log('==================================');
  
  for (const test of testEndpoints) {
    await testEndpoint(test.method, test.endpoint, test.desc, test.body);
  }
  
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log('If any API endpoints return HTML instead of JSON,');
  console.log('this indicates a server routing configuration issue.');
}

runTests().catch(console.error);
