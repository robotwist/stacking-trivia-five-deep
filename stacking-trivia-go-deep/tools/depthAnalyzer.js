/**
 * Deep Dive Quality Analyzer
 * Validates that trivia stacks maintain progressive depth vs. breadth
 */

// Quality metrics and analysis
class StackDepthAnalyzer {
  constructor() {
    this.depthIndicators = [
      'how', 'why', 'which specific', 'what caused', 'who exactly',
      'what happened when', 'what was the result', 'what led to',
      'nickname', 'behind the scenes', 'lesser known', 'real reason'
    ];
    
    this.breadthWarnings = [
      'different', 'another', 'also', 'switching to', 'moving on',
      'in contrast', 'meanwhile', 'separately', 'unrelated'
    ];

    this.expertLevelIndicators = [
      'assistant', 'second', 'backup', 'exact date', 'specific number',
      'real name', 'middle name', 'maiden name', 'original title',
      'working title', 'first draft', 'behind closed doors'
    ];
  }

  analyzeStack(stack) {
    const analysis = {
      title: stack.title,
      totalQuestions: stack.questions.length,
      depthScore: 0,
      breadthWarnings: 0,
      expertLevel: 0,
      progression: [],
      recommendations: []
    };

    // Analyze each question
    for (let i = 0; i < stack.questions.length; i++) {
      const question = stack.questions[i];
      const questionAnalysis = this.analyzeQuestion(question, i, stack.questions);
      
      analysis.progression.push(questionAnalysis);
      analysis.depthScore += questionAnalysis.depthScore;
      analysis.breadthWarnings += questionAnalysis.breadthWarning ? 1 : 0;
      analysis.expertLevel += questionAnalysis.expertLevel;
    }

    // Calculate averages
    analysis.depthScore = analysis.depthScore / stack.questions.length;
    analysis.expertLevel = analysis.expertLevel / stack.questions.length;

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  analyzeQuestion(question, index, allQuestions) {
    const text = (question.question || question.question_text || '').toLowerCase();
    const answer = (question.answer || question.correct_answer || '').toLowerCase();
    
    let depthScore = 0;
    let breadthWarning = false;
    let expertLevel = 0;

    // Check for depth indicators
    this.depthIndicators.forEach(indicator => {
      if (text.includes(indicator)) {
        depthScore += 2;
      }
    });

    // Check for breadth warnings
    this.breadthWarnings.forEach(warning => {
      if (text.includes(warning)) {
        breadthWarning = true;
      }
    });

    // Check for expert level indicators
    this.expertLevelIndicators.forEach(indicator => {
      if (text.includes(indicator) || answer.includes(indicator)) {
        expertLevel += 3;
      }
    });

    // Progressive difficulty bonus
    if (index > 10 && (text.includes('specific') || text.includes('exact'))) {
      depthScore += 1;
    }

    if (index > 20 && text.length > 100) { // Complex questions late in stack
      depthScore += 1;
    }

    // Reference to earlier questions (good for depth)
    if (index > 0 && this.referencesEarlierContent(question, allQuestions.slice(0, index))) {
      depthScore += 3;
    }

    return {
      level: question.level || index + 1,
      text: text,
      depthScore,
      breadthWarning,
      expertLevel,
      classification: this.classifyQuestion(depthScore, expertLevel, index)
    };
  }

  referencesEarlierContent(question, previousQuestions) {
    const currentText = (question.question || question.question_text || '').toLowerCase();
    
    return previousQuestions.some(prevQ => {
      const prevAnswer = (prevQ.answer || prevQ.correct_answer || '').toLowerCase();
      const prevWords = prevAnswer.split(' ');
      
      return prevWords.some(word => 
        word.length > 3 && currentText.includes(word)
      );
    });
  }

  classifyQuestion(depthScore, expertLevel, index) {
    if (index < 5) return 'Foundation';
    if (index < 15) return depthScore > 2 ? 'Context' : 'Basic';
    if (index < 25) return expertLevel > 0 ? 'Insider' : 'Intermediate';
    return expertLevel > 2 ? 'Expert' : 'Advanced';
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.depthScore < 1.5) {
      recommendations.push({
        type: 'CRITICAL',
        message: 'Stack lacks progressive depth - questions feel disconnected',
        suggestion: 'Make later questions build on earlier answers'
      });
    }

    if (analysis.breadthWarnings > analysis.totalQuestions * 0.2) {
      recommendations.push({
        type: 'WARNING',
        message: 'Too many breadth indicators - may be covering too wide a range',
        suggestion: 'Focus on one specific aspect and go deeper'
      });
    }

    if (analysis.expertLevel < 0.3 && analysis.totalQuestions > 20) {
      recommendations.push({
        type: 'IMPROVEMENT',
        message: 'Lacks expert-level questions for true depth',
        suggestion: 'Add more insider knowledge and specific details in later questions'
      });
    }

    // Check progression
    const lastFive = analysis.progression.slice(-5);
    const foundationCount = lastFive.filter(q => q.classification === 'Foundation').length;
    
    if (foundationCount > 1) {
      recommendations.push({
        type: 'WARNING',
        message: 'Late questions still at foundation level',
        suggestion: 'Questions 25+ should require expert knowledge'
      });
    }

    return recommendations;
  }

  generateReport(analysis) {
    let report = `
🎯 DEEP DIVE QUALITY ANALYSIS: ${analysis.title}
================================================

📊 METRICS:
   Questions: ${analysis.totalQuestions}
   Depth Score: ${analysis.depthScore.toFixed(2)}/5 ${this.getScoreEmoji(analysis.depthScore)}
   Expert Level: ${analysis.expertLevel.toFixed(2)}/3 ${this.getExpertEmoji(analysis.expertLevel)}
   Breadth Warnings: ${analysis.breadthWarnings} ${analysis.breadthWarnings > 3 ? '⚠️' : '✅'}

📈 PROGRESSION BREAKDOWN:
`;

    const classifications = {};
    analysis.progression.forEach(q => {
      classifications[q.classification] = (classifications[q.classification] || 0) + 1;
    });

    Object.entries(classifications).forEach(([type, count]) => {
      report += `   ${type}: ${count} questions\n`;
    });

    if (analysis.recommendations.length > 0) {
      report += `\n🔧 RECOMMENDATIONS:\n`;
      analysis.recommendations.forEach(rec => {
        const emoji = rec.type === 'CRITICAL' ? '🚨' : rec.type === 'WARNING' ? '⚠️' : '💡';
        report += `   ${emoji} ${rec.message}\n`;
        report += `      → ${rec.suggestion}\n\n`;
      });
    } else {
      report += `\n✅ EXCELLENT! This stack maintains proper deep dive progression.\n`;
    }

    report += `\n🎯 OVERALL RATING: ${this.getOverallRating(analysis)}\n`;

    return report;
  }

  getScoreEmoji(score) {
    if (score >= 3) return '🏆 EXCELLENT';
    if (score >= 2) return '✅ GOOD';  
    if (score >= 1) return '⚠️ NEEDS IMPROVEMENT';
    return '🚨 POOR';
  }

  getExpertEmoji(score) {
    if (score >= 2) return '🧠 EXPERT LEVEL';
    if (score >= 1) return '📚 INTERMEDIATE';
    return '📖 BASIC';
  }

  getOverallRating(analysis) {
    let rating = 0;
    
    if (analysis.depthScore >= 2) rating += 25;
    if (analysis.expertLevel >= 1) rating += 25;  
    if (analysis.breadthWarnings < analysis.totalQuestions * 0.1) rating += 25;
    if (analysis.recommendations.filter(r => r.type === 'CRITICAL').length === 0) rating += 25;

    if (rating >= 90) return '🏆 MASTERPIECE - Perfect deep dive progression';
    if (rating >= 75) return '⭐ EXCELLENT - Great depth with minor improvements possible';
    if (rating >= 60) return '✅ GOOD - Solid depth, some refinement needed';
    if (rating >= 40) return '⚠️ FAIR - Needs more depth focus';
    return '🚨 POOR - Major depth issues, too broad';
  }

  // Batch analyze multiple stacks
  analyzeMultipleStacks(stacks) {
    console.log('🔍 ANALYZING STACK DEPTH QUALITY...\n');
    
    const results = stacks.map(stack => {
      const analysis = this.analyzeStack(stack);
      console.log(this.generateReport(analysis));
      return analysis;
    });

    // Summary report
    console.log(`\n📋 BATCH ANALYSIS SUMMARY:`);
    console.log(`   Total Stacks: ${results.length}`);
    console.log(`   Average Depth: ${(results.reduce((sum, r) => sum + r.depthScore, 0) / results.length).toFixed(2)}`);
    console.log(`   Excellent Stacks: ${results.filter(r => r.depthScore >= 3).length}`);
    console.log(`   Stacks Needing Improvement: ${results.filter(r => r.depthScore < 2).length}`);

    return results;
  }
}

// Export for use in other files
export { StackDepthAnalyzer };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  // Example usage with Nebraska stack
  const nebraskaStack = {
    title: "Nebraska Sports - The Ultimate Deep Dive",
    questions: [
      { level: 1, question: "What is the name of the University of Nebraska's football team?", answer: "Cornhuskers" },
      { level: 2, question: "In what stadium do the Nebraska Cornhuskers play their home games?", answer: "Memorial Stadium" },
      { level: 21, question: "How many consecutive sellouts did Memorial Stadium have from 1962-2022?", answer: "375" },
      { level: 28, question: "What was Nebraska's nickname for their dominant offensive line in the 1990s?", answer: "Pipeline" },
      { level: 34, question: "What is Nebraska's team motto that appears on their weight room wall?", answer: "Through These Doors Walk Champions" }
    ]
  };

  const analyzer = new StackDepthAnalyzer();
  const analysis = analyzer.analyzeStack(nebraskaStack);
  console.log(analyzer.generateReport(analysis));
}
