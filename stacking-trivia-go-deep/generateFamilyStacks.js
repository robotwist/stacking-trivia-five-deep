#!/usr/bin/env node
// Family Stack Autogen Command Line Interface
// Usage: node generateFamilyStacks.js [options]

import { familyBatchGenerator } from './src/utils/FamilyStackBatchGenerator.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const options = {
    priority: null,
    single: null,
    analyze: false,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--priority':
      case '-p':
        options.priority = parseInt(args[i + 1]);
        i++; // Skip next arg
        break;
      case '--single':
      case '-s':
        options.single = args[i + 1];
        i++; // Skip next arg
        break;
      case '--analyze':
      case '-a':
        options.analyze = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }
  
  if (options.help) {
    console.log(`
🏠 FAMILY STACK AUTOGEN SYSTEM

Usage: node generateFamilyStacks.js [options]

Options:
  -p, --priority <1|2|3>     Generate only stacks with priority level or below
  -s, --single <topic>       Generate a single stack by topic name
  -a, --analyze             Run quality analysis after generation
  -h, --help                Show this help message

Examples:
  node generateFamilyStacks.js                    # Generate all 12 family stacks
  node generateFamilyStacks.js -p 1               # Generate only priority 1 stacks
  node generateFamilyStacks.js -s "james taylor"  # Generate only James Taylor stack
  node generateFamilyStacks.js -a                 # Generate all + run analysis

Priority Levels:
  1: High entertainment value (Ernest, James Taylor, Tyler the Creator, etc.)
  2: Specialized knowledge (Cattle, Tomatoes, Education)
  3: Children's content (Blippi)
    `);
    return;
  }
  
  console.log(`🤖 AUTONOMOUS FAMILY STACK GENERATION SYSTEM`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 Configuration:`);
  
  if (options.single) {
    console.log(`   Mode: Single stack generation`);
    console.log(`   Topic: ${options.single}`);
  } else {
    console.log(`   Mode: Batch generation`);
    console.log(`   Priority filter: ${options.priority || 'None (all stacks)'}`);
  }
  
  console.log(`   Quality analysis: ${options.analyze ? 'Enabled' : 'Disabled'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  try {
    let results;
    
    if (options.single) {
      console.log(`🎯 Generating single stack: ${options.single}`);
      results = await familyBatchGenerator.generateSingleStack(options.single);
      
      if (results) {
        console.log(`✅ Single stack generation complete:`);
        console.log(`   Topic: ${results.topic}`);
        console.log(`   Quality: ${results.qualityScore}/100`);
        console.log(`   File: ${results.file}`);
      }
    } else {
      console.log(`🏭 Starting batch generation...`);
      results = await familyBatchGenerator.generateAllFamilyStacks(options.priority);
    }
    
    // Run quality analysis if requested
    if (options.analyze && results) {
      console.log(`\n🔍 Running post-generation quality analysis...`);
      
      try {
        const { stdout, stderr } = await execAsync('node analyzeAllStacks.js');
        console.log(`\n📊 QUALITY ANALYSIS RESULTS:`);
        console.log(stdout);
        if (stderr) {
          console.log(`⚠️ Analysis warnings:`, stderr);
        }
      } catch (analysisError) {
        console.log(`❌ Quality analysis failed:`, analysisError.message);
      }
    }
    
    console.log(`\n🎉 Autogen system complete!`);
    
    if (!options.single && results.successful.length > 0) {
      console.log(`\n🔗 Next steps:`);
      console.log(`   1. Review generated stacks in their category folders`);
      console.log(`   2. Test hypertextual connections with StackConnector.js`);
      console.log(`   3. Run quality analysis: node analyzeAllStacks.js`);
      console.log(`   4. Deploy to production when ready`);
    }
    
  } catch (error) {
    console.error(`❌ Generation failed:`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Show the family request list for reference
function showFamilyRequests() {
  console.log(`\n📋 FAMILY STACK REQUESTS:`);
  familyBatchGenerator.familyRequests.forEach((req, index) => {
    console.log(`   ${index + 1}. ${req.topic} (Priority ${req.priority}, ${req.category})`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
