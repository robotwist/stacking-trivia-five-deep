// Family Stack Batch Generator
// Orchestrates autonomous generation of the 11 requested family stacks

import { autonomousGenerator } from './AutonomousStackGenerator.js';
import fs from 'fs/promises';
import path from 'path';

export class FamilyStackBatchGenerator {
  constructor() {
    this.familyRequests = [
      {
        topic: 'Ernest Movies',
        category: 'cinema',
        template: 'family-entertainment',
        filename: 'ernest-movies.json',
        priority: 1,
        notes: 'Jim Varney\'s beloved character across multiple films'
      },
      {
        topic: 'James Taylor',
        category: 'arts-culture', 
        template: 'music-artist',
        filename: 'james-taylor.json',
        priority: 1,
        notes: 'Folk-rock legend with decades of influence'
      },
      {
        topic: 'Charlois Cattle',
        category: 'science-technology',
        template: 'specialized-knowledge',
        filename: 'charlois-cattle.json',
        priority: 2,
        notes: 'French cattle breed known for excellent meat quality'
      },
      {
        topic: 'Tomato Breeds',
        category: 'science-technology',
        template: 'specialized-knowledge', 
        filename: 'tomato-breeds.json',
        priority: 2,
        notes: 'Heirloom and hybrid varieties with unique characteristics'
      },
      {
        topic: 'Early Childhood Education',
        category: 'actually',
        template: 'specialized-knowledge',
        filename: 'early-childhood-education.json',
        priority: 2,
        notes: 'Developmental approaches and educational theories'
      },
      {
        topic: 'Wes Anderson',
        category: 'cinema',
        template: 'family-entertainment',
        filename: 'wes-anderson.json',
        priority: 1,
        notes: 'Distinctive visual style and storytelling approach'
      },
      {
        topic: 'OKC Thunder',
        category: 'sports',
        template: 'family-entertainment',
        filename: 'okc-thunder.json',
        priority: 1,
        notes: 'Oklahoma City\'s NBA team with passionate fanbase'
      },
      {
        topic: 'Tyler the Creator',
        category: 'arts-culture',
        template: 'music-artist',
        filename: 'tyler-the-creator.json',
        priority: 1,
        notes: 'Innovative hip-hop artist and Odd Future founder'
      },
      {
        topic: 'The Cranberries',
        category: 'arts-culture',
        template: 'music-artist',
        filename: 'the-cranberries.json',
        priority: 1,
        notes: 'Irish rock band known for distinctive vocals and melodies'
      },
      {
        topic: 'Tame Impala',
        category: 'arts-culture',
        template: 'music-artist',
        filename: 'tame-impala.json',
        priority: 1,
        notes: 'Kevin Parker\'s psychedelic music project'
      },
      {
        topic: 'Jalen Brunson',
        category: 'sports',
        template: 'family-entertainment',
        filename: 'jalen-brunson.json',
        priority: 1,
        notes: 'NBA point guard known for clutch performances'
      },
      {
        topic: 'Blippi',
        category: 'kids',
        template: 'family-entertainment',
        filename: 'blippi.json',
        priority: 3,
        notes: 'Educational children\'s entertainer with colorful content'
      }
    ];
    
    this.outputDir = '/home/robwistrand/code/game-dev/stacking-trivia-go-deep/stacking-trivia-go-deep/src/data/categories';
  }
  
  async generateAllFamilyStacks(priorityFilter = null) {
    console.log(`🏠 FAMILY STACK BATCH GENERATION INITIATED`);
    console.log(`📊 Total requests: ${this.familyRequests.length}`);
    
    let requestsToProcess = this.familyRequests;
    if (priorityFilter) {
      requestsToProcess = this.familyRequests.filter(req => req.priority <= priorityFilter);
      console.log(`🎯 Filtering to priority ${priorityFilter} and below: ${requestsToProcess.length} stacks`);
    }
    
    const results = {
      successful: [],
      failed: [],
      qualityReport: {
        totalStacks: requestsToProcess.length,
        averageScore: 0,
        highQuality: 0, // 80+
        mediumQuality: 0, // 60-79
        lowQuality: 0 // <60
      }
    };
    
    console.log(`\n🚀 Beginning generation process...\n`);
    
    for (const request of requestsToProcess) {
      try {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📝 Processing: ${request.topic}`);
        console.log(`   Category: ${request.category}`);
        console.log(`   Template: ${request.template}`);
        console.log(`   Notes: ${request.notes}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        
        // Generate the stack
        const stack = await autonomousGenerator.generateStack(
          request.topic,
          request.category,
          request.template
        );
        
        // Add metadata
        stack.familyRequest = {
          originalTopic: request.topic,
          priority: request.priority,
          generatedAt: new Date().toISOString()
        };
        
        // Save to appropriate category directory
        const categoryPath = path.join(this.outputDir, request.category);
        await fs.mkdir(categoryPath, { recursive: true });
        
        const filePath = path.join(categoryPath, request.filename);
        await fs.writeFile(filePath, JSON.stringify(stack, null, 2));
        
        console.log(`✅ SUCCESS: ${request.topic}`);
        console.log(`   Quality Score: ${stack.qualityScore}/100`);
        console.log(`   Connections: ${stack.connections.length}`);
        console.log(`   File: ${filePath}`);
        
        results.successful.push({
          topic: request.topic,
          file: filePath,
          qualityScore: stack.qualityScore,
          connections: stack.connections.length
        });
        
        // Track quality distribution
        if (stack.qualityScore >= 80) results.qualityReport.highQuality++;
        else if (stack.qualityScore >= 60) results.qualityReport.mediumQuality++;
        else results.qualityReport.lowQuality++;
        
      } catch (error) {
        console.log(`❌ FAILED: ${request.topic}`);
        console.log(`   Error: ${error.message}`);
        
        results.failed.push({
          topic: request.topic,
          error: error.message
        });
      }
    }
    
    // Calculate final metrics
    if (results.successful.length > 0) {
      results.qualityReport.averageScore = Math.round(
        results.successful.reduce((sum, s) => sum + s.qualityScore, 0) / results.successful.length
      );
    }
    
    this.printFinalReport(results);
    return results;
  }
  
  printFinalReport(results) {
    console.log(`\n\n🎉 FAMILY STACK GENERATION COMPLETE`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 FINAL RESULTS:`);
    console.log(`   ✅ Successful: ${results.successful.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}`);
    console.log(`   📈 Average Quality Score: ${results.qualityReport.averageScore}/100`);
    console.log(`\n🏆 QUALITY DISTRIBUTION:`);
    console.log(`   🥇 High Quality (80+): ${results.qualityReport.highQuality} stacks`);
    console.log(`   🥈 Medium Quality (60-79): ${results.qualityReport.mediumQuality} stacks`);
    console.log(`   🥉 Low Quality (<60): ${results.qualityReport.lowQuality} stacks`);
    
    if (results.successful.length > 0) {
      console.log(`\n📁 GENERATED FILES:`);
      results.successful.forEach(stack => {
        console.log(`   📄 ${stack.topic} (${stack.qualityScore}/100) → ${stack.file}`);
      });
    }
    
    if (results.failed.length > 0) {
      console.log(`\n⚠️  FAILED GENERATIONS:`);
      results.failed.forEach(failure => {
        console.log(`   ❌ ${failure.topic}: ${failure.error}`);
      });
    }
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔥 Family trivia collection ready for hypertextual connections!`);
  }
  
  async generateSingleStack(topicName) {
    const request = this.familyRequests.find(req => 
      req.topic.toLowerCase().includes(topicName.toLowerCase())
    );
    
    if (!request) {
      throw new Error(`Topic '${topicName}' not found in family requests`);
    }
    
    return await this.generateAllFamilyStacks().then(results => 
      results.successful.find(s => s.topic === request.topic)
    );
  }
}

export const familyBatchGenerator = new FamilyStackBatchGenerator();
