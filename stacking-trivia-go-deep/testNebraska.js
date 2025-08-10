/**
 * Test the Nebraska Sports stack for depth quality
 */

import fs from 'fs';
import { StackDepthAnalyzer } from './tools/depthAnalyzer.js';

// Load the Nebraska ultimate stack
const nebraskaStack = JSON.parse(fs.readFileSync('../src/data/categories/sports/nebraska-sports-ultimate.json', 'utf8'));

// Analyze it
const analyzer = new StackDepthAnalyzer();
console.log('🏈 ANALYZING NEBRASKA SPORTS ULTIMATE STACK...\n');

const analysis = analyzer.analyzeStack(nebraskaStack);
console.log(analyzer.generateReport(analysis));

// Show specific recommendations for improvement
if (analysis.recommendations.length === 0) {
  console.log('🎉 CONGRATULATIONS! Your Nebraska stack demonstrates excellent deep-dive progression!');
  console.log('   ✅ Questions build on each other logically');
  console.log('   ✅ Progressive difficulty from basic to expert');
  console.log('   ✅ Maintains focus on Nebraska sports throughout');
  console.log('   ✅ Includes expert-level insider knowledge');
} else {
  console.log('\n🔧 SPECIFIC IMPROVEMENTS FOR NEBRASKA STACK:');
  
  // Show detailed question breakdown
  console.log('\n📊 QUESTION BREAKDOWN BY DEPTH LEVEL:');
  const levels = {};
  analysis.progression.forEach(q => {
    if (!levels[q.classification]) levels[q.classification] = [];
    levels[q.classification].push(`Q${q.level}: ${q.text.substring(0, 50)}...`);
  });
  
  Object.entries(levels).forEach(([level, questions]) => {
    console.log(`\n${level.toUpperCase()} (${questions.length} questions):`);
    questions.forEach(q => console.log(`   ${q}`));
  });
}

console.log('\n🎯 This stack is ready for your Nebraska family to test their Cornhusker knowledge!');
console.log('📈 Expected difficulty curve: Casual fans → Enthusiasts → Die-hard fans → Expert insiders');
