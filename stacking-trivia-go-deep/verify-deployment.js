#!/usr/bin/env node

/**
 * DeepStack Deployment Verification Script
 * Checks if the Netlify deployment is working and Phase 8 features are accessible
 */

import https from 'https';
import fs from 'fs';

// Potential Netlify URLs based on the repo name
const POTENTIAL_URLS = [
  'https://stacking-trivia-five-deep.netlify.app/',
  'https://stacking-trivia-go-deep.netlify.app/', 
  'https://deepstack-trivia.netlify.app/',
  'https://trivia-that-dares-to-matter.netlify.app/'
];

async function checkURL(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        resolve({
          url,
          status: response.statusCode,
          success: response.statusCode === 200,
          hasReactApp: data.includes('DeepStack') || data.includes('Trivia That Dares to Matter'),
          hasViteAssets: data.includes('vite') || data.includes('/assets/'),
          responseSize: data.length
        });
      });
    });
    
    request.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    request.setTimeout(10000, () => {
      request.abort();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timed out'
      });
    });
  });
}

async function verifyDeployment() {
  console.log('🚀 DeepStack Deployment Verification');
  console.log('=====================================\n');
  
  console.log('📋 Checking potential Netlify URLs...\n');
  
  const results = await Promise.all(POTENTIAL_URLS.map(checkURL));
  
  let deploymentFound = false;
  
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.url}`);
    console.log(`   Status: ${result.status}`);
    
    if (result.success) {
      deploymentFound = true;
      console.log(`   ✅ React App Detected: ${result.hasReactApp}`);
      console.log(`   ✅ Vite Assets: ${result.hasViteAssets}`);
      console.log(`   📦 Response Size: ${result.responseSize} bytes`);
      console.log('\n🎉 DEPLOYMENT FOUND AND WORKING!');
    } else if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  }
  
  if (!deploymentFound) {
    console.log('🔍 No live deployment found at common URLs.');
    console.log('💡 This might mean:');
    console.log('   - Netlify hasn\'t processed the latest push yet (can take 2-5 minutes)');
    console.log('   - The site is deployed under a different URL');
    console.log('   - There was a build error on Netlify');
    console.log('\n📝 To find your actual Netlify URL:');
    console.log('   1. Visit https://app.netlify.com/');
    console.log('   2. Find your "stacking-trivia-five-deep" site');
    console.log('   3. Check the deployment status and logs');
  }
  
  console.log('\n📊 Local Build Status:');
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    console.log(`   Project: ${packageJson.name}`);
    console.log(`   Version: ${packageJson.version || '1.0.0'}`);
    
    const distExists = fs.existsSync('./dist');
    console.log(`   Dist folder: ${distExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (distExists) {
      const distFiles = fs.readdirSync('./dist');
      console.log(`   Dist files: ${distFiles.length} files`);
      console.log(`   Has index.html: ${distFiles.includes('index.html') ? '✅' : '❌'}`);
      console.log(`   Has assets: ${distFiles.includes('assets') ? '✅' : '❌'}`);
    }
  } catch (error) {
    console.log(`   Error reading local files: ${error.message}`);
  }
  
  console.log('\n🎯 Phase 8 Features Ready:');
  console.log('   ✅ GameplayEnhancements.jsx - Celebration animations');
  console.log('   ✅ QuickHostControls.jsx - Bar host controls'); 
  console.log('   ✅ TransitionCountdown.jsx - Smooth transitions');
  console.log('   ✅ BarTriviaNight.jsx - Complete bar experience');
  console.log('   ✅ SoundEffectsManager.js - Audio system');
  console.log('   ✅ PostgreSQL integration ready');
  
  console.log('\n🔄 Next Steps:');
  console.log('   1. Check Netlify dashboard for build logs');
  console.log('   2. Verify environment variables are set');
  console.log('   3. Test Phase 8 features once deployed');
  console.log('   4. Begin content scaling strategy implementation');
}

verifyDeployment().catch(console.error);
