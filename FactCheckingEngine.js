// Fact-Checking Engine Prototype
// Multi-source verification system for trivia accuracy

class FactCheckingEngine {
    constructor() {
        this.sourceHierarchy = {
            tier1: ['Official records', 'Government databases', 'Academic papers'],
            tier2: ['Encyclopedia Britannica', 'Museum websites', 'Professional organizations'],
            tier3: ['Wikipedia', 'Reputable news sources', 'Educational institutions'],
            tier4: ['General websites', 'Fan sites', 'Social media']
        };
        
        this.accuracyThresholds = {
            expert: 95,      // Level 25+ requires 95%+ confidence
            insider: 90,     // Level 15-24 requires 90%+ confidence  
            context: 85,     // Level 8-14 requires 85%+ confidence
            foundation: 80   // Level 1-7 requires 80%+ confidence
        };
    }

    // Analyze a complete stack for accuracy issues
    analyzeStackAccuracy(stack) {
        console.log(`🔍 FACT-CHECKING: ${stack.title}`);
        console.log('=' .repeat(50));
        
        const results = {
            totalQuestions: stack.questions.length,
            accuracyIssues: [],
            sourceNeeds: [],
            confidenceScores: [],
            overallRating: 'PENDING'
        };

        stack.questions.forEach((q, index) => {
            const level = q.level || index + 1;
            const analysis = this.analyzeQuestion(q, level);
            
            results.accuracyIssues.push(...analysis.issues);
            results.sourceNeeds.push(...analysis.sourceNeeds);
            results.confidenceScores.push(analysis.confidence);
            
            // Show detailed analysis for problematic questions
            if (analysis.issues.length > 0 || analysis.confidence < 80) {
                console.log(`\n❌ Q${level}: ${q.question}`);
                console.log(`   Answer: ${q.answer || 'MISSING'}`);
                console.log(`   Confidence: ${analysis.confidence}%`);
                analysis.issues.forEach(issue => console.log(`   🚨 ${issue}`));
                analysis.sourceNeeds.forEach(need => console.log(`   📚 ${need}`));
            }
        });

        // Calculate overall accuracy rating
        const avgConfidence = results.confidenceScores.reduce((a, b) => a + b, 0) / results.confidenceScores.length;
        const criticalIssues = results.accuracyIssues.filter(issue => 
            issue.includes('CRITICAL') || issue.includes('MISSING')).length;

        if (avgConfidence >= 95 && criticalIssues === 0) results.overallRating = 'PRODUCTION_READY';
        else if (avgConfidence >= 90 && criticalIssues <= 2) results.overallRating = 'MINOR_FIXES_NEEDED';
        else if (avgConfidence >= 80 && criticalIssues <= 5) results.overallRating = 'MAJOR_REVISION_NEEDED';
        else results.overallRating = 'COMPLETE_REBUILD_REQUIRED';

        this.displaySummary(results, avgConfidence);
        return results;
    }

    // Analyze individual question for accuracy
    analyzeQuestion(question, level) {
        const issues = [];
        const sourceNeeds = [];
        let confidence = 100;

        // Critical issues
        if (!question.answer || question.answer.trim() === '') {
            issues.push('CRITICAL: Missing answer');
            confidence -= 50;
        }

        if (question.answer && question.answer.length < 2) {
            issues.push('CRITICAL: Answer too short');
            confidence -= 20;
        }

        // Content analysis
        const fullText = `${question.question} ${question.answer || ''} ${question.explanation || ''}`.toLowerCase();
        
        // Flag uncertainty language
        const uncertainWords = ['probably', 'likely', 'supposedly', 'allegedly', 'rumored'];
        uncertainWords.forEach(word => {
            if (fullText.includes(word)) {
                issues.push(`ACCURACY: Uncertain language - "${word}"`);
                confidence -= 10;
            }
        });

        // Flag vague language
        const vagueWords = ['about', 'around', 'approximately', 'roughly'];
        vagueWords.forEach(word => {
            if (fullText.includes(word)) {
                issues.push(`PRECISION: Vague language - "${word}"`);
                confidence -= 5;
            }
        });

        // Check for conflicting information
        const conflictWords = ['actually', 'wait', 'correction', 'no that'];
        conflictWords.forEach(word => {
            if (fullText.includes(word)) {
                issues.push(`CRITICAL: Conflicting information - "${word}"`);
                confidence -= 25;
            }
        });

        // Source requirements based on question level
        const tier = this.getQuestionTier(level);
        const requiredConfidence = this.accuracyThresholds[tier];
        
        if (!question.explanation || question.explanation.length < 20) {
            sourceNeeds.push(`Needs detailed explanation (${tier} level requires context)`);
            confidence -= 15;
        }

        // Specific fact-checking needs
        if (this.containsNumericData(fullText)) {
            sourceNeeds.push('Numeric data requires official source verification');
        }

        if (this.containsDates(fullText)) {
            sourceNeeds.push('Date information needs historical record confirmation');  
        }

        if (this.containsNames(fullText)) {
            sourceNeeds.push('Names/titles require authoritative source spelling check');
        }

        if (level >= 20) {
            sourceNeeds.push(`Expert level (${level}) requires primary source verification`);
        }

        return {
            issues,
            sourceNeeds,
            confidence: Math.max(0, confidence),
            requiredConfidence,
            tier
        };
    }

    getQuestionTier(level) {
        if (level >= 25) return 'expert';
        if (level >= 15) return 'insider';  
        if (level >= 8) return 'context';
        return 'foundation';
    }

    containsNumericData(text) {
        return /\d+/.test(text);
    }

    containsDates(text) {
        return /\b(19|20)\d{2}\b|\b\d{4}\b/.test(text);
    }

    containsNames(text) {
        return /[A-Z][a-z]+\s[A-Z][a-z]+/.test(text);
    }

    displaySummary(results, avgConfidence) {
        console.log('\n' + '='.repeat(50));
        console.log('📊 ACCURACY SUMMARY');
        console.log('='.repeat(50));
        console.log(`Questions Analyzed: ${results.totalQuestions}`);
        console.log(`Average Confidence: ${Math.round(avgConfidence)}%`);
        console.log(`Critical Issues: ${results.accuracyIssues.filter(i => i.includes('CRITICAL')).length}`);
        console.log(`Source Needs: ${results.sourceNeeds.length}`);
        console.log(`Overall Rating: ${results.overallRating}\n`);

        // Recommendations
        console.log('🎯 IMMEDIATE ACTION ITEMS:');
        if (results.overallRating === 'COMPLETE_REBUILD_REQUIRED') {
            console.log('   1. Fill all missing answers');
            console.log('   2. Add explanations to all questions');
            console.log('   3. Remove uncertain/conflicting language');
            console.log('   4. Verify all facts with authoritative sources');
        } else if (results.overallRating === 'MAJOR_REVISION_NEEDED') {
            console.log('   1. Fix critical accuracy issues');
            console.log('   2. Add source citations to expert-level questions');
            console.log('   3. Replace vague language with specific facts');
        } else if (results.overallRating === 'MINOR_FIXES_NEEDED') {
            console.log('   1. Address remaining uncertainty language');
            console.log('   2. Add missing source citations');
        } else {
            console.log('   ✅ Stack meets production accuracy standards!');
        }
    }
}

// Usage Example - Analyze the Nebraska ultimate stack
if (require.main === module) {
    const fs = require('fs');
    const engine = new FactCheckingEngine();
    
    try {
        const nebraskaStack = JSON.parse(fs.readFileSync('./nebraska-sports-ultimate.json', 'utf8'));
        const results = engine.analyzeStackAccuracy(nebraskaStack);
        
        console.log('\n🔮 AUTONOMOUS GENERATION READINESS:');
        if (results.overallRating === 'PRODUCTION_READY') {
            console.log('   ✅ This stack demonstrates the quality standard for autonomous generation');
            console.log('   ✅ Can be used as training data for AI question generation');
            console.log('   ✅ Accuracy verification protocols are working');
        } else {
            console.log('   ⏳ Stack needs refinement before serving as autonomous generation template');
            console.log('   🎯 Fix identified issues to establish quality baseline');
        }
        
    } catch (error) {
        console.error('Error analyzing stack:', error.message);
    }
}

module.exports = FactCheckingEngine;
