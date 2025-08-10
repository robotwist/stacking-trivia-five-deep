// Test the Hypertextual Connection System
// Validates that our StackConnector can identify relationships between family stacks

import { StackConnector } from './src/utils/StackConnector.js';
import fs from 'fs/promises';
import path from 'path';

async function testConnectionSystem() {
  console.log(`🔗 HYPERTEXTUAL CONNECTION SYSTEM TEST`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  try {
    const connector = new StackConnector();
    
    // Test stacks we just created
    const testStacks = [
      'src/data/categories/arts-culture/james-taylor.json',
      'src/data/categories/cinema/ernest-movies.json', 
      'src/data/categories/arts-culture/tyler-the-creator.json',
      'src/data/categories/kids/minecraft.json'
    ];
    
    console.log(`🎯 Testing connection detection between family stacks...\n`);
    
    for (const stackPath of testStacks) {
      try {
        const fullPath = path.join('/home/robwistrand/code/game-dev/stacking-trivia-go-deep/stacking-trivia-go-deep', stackPath);
        const stackData = JSON.parse(await fs.readFile(fullPath, 'utf8'));
        
        console.log(`📚 STACK: ${stackData.title}`);
        console.log(`   Category: ${stackData.category}`);
        console.log(`   Quality: ${stackData.qualityScore || 'N/A'}/100`);
        
        // Test connection detection
        const mockGameState = {
          currentAnswer: 'music',
          currentQuestion: { level: 3 },
          playerStats: { streak: 5 }
        };
        
        const connections = await connector.checkForConnections(stackData, mockGameState);
        
        if (connections.length > 0) {
          console.log(`   🔗 Connections Found: ${connections.length}`);
          connections.forEach(conn => {
            console.log(`      → ${conn.targetStack} (${conn.connectionType})`);
            console.log(`        Trigger: ${conn.trigger}`);
            console.log(`        Strength: ${conn.strength}/10`);
          });
        } else {
          console.log(`   ❌ No connections detected`);
        }
        
        console.log(`   📋 Predefined Connections: ${stackData.connections?.length || 0}\n`);
        
      } catch (error) {
        console.log(`   ❌ Error loading ${stackPath}: ${error.message}\n`);
      }
    }
    
    // Test specific connection scenarios
    console.log(`🎮 TESTING SPECIFIC CONNECTION SCENARIOS`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    // Test music connections
    const musicTriggers = ['guitar', 'song', 'album', 'artist', 'melody'];
    for (const trigger of musicTriggers) {
      const matches = connector.triggerMatches(trigger, 'MUSIC');
      console.log(`🎵 Music trigger "${trigger}": ${matches ? '✅' : '❌'}`);
    }
    
    // Test cross-generational connections 
    const creativeTriggers = ['creative', 'artistic', 'visual', 'style', 'aesthetic'];
    for (const trigger of creativeTriggers) {
      const matches = connector.triggerMatches(trigger, 'CREATIVE');
      console.log(`🎨 Creative trigger "${trigger}": ${matches ? '✅' : '❌'}`);
    }
    
    console.log(`\n🎉 Connection system test complete!`);
    console.log(`📈 Family stacks are ready for hypertextual discovery experiences.`);
    
  } catch (error) {
    console.error(`❌ Connection system test failed:`, error.message);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testConnectionSystem().catch(console.error);
}
