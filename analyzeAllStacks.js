// Comprehensive Quality Analysis for All Trivia Stacks
const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE STACK ANALYSIS - Quality & Accuracy Audit\n');

// Dynamically find all stack files to analyze
function findStackFiles() {
    const possiblePaths = [
        // Root level JSON files
        './the_beatles.json',
        './blade_runner.json', 
        './olympic_distance_current.json',
        './nebraska_sports.json',
        './nebraska-sports-ultimate.json',
        './olympic_distance_1980s.json',
        './ancient_greece.json',
        // Nested src structures
        './src/stacks/van-gogh.json',
        './src/data/categories/sports/nebraska-sports-ultimate.json',
        './stacking-trivia-go-deep/src/data/categories/sports/nebraska-sports-ultimate.json',
        // Find other potential locations
        './stacking-trivia-go-deep/src/stacks/el-guerrouj-king-of-mile.json',
        './stacking-trivia-go-deep/src/stacks/seb-coe-middle-distance-maestro.json',
        './stacking-trivia-go-deep/src/stacks/prefontaine-rebels-fire.json',
        './stacking-trivia-go-deep/src/stacks/billy-mills-impossible-10k.json'
    ];
    
    return possiblePaths.filter(f => fs.existsSync(f));
}

const stackFiles = findStackFiles();

// Accuracy red flags to check for
const accuracyWarnings = {
    vague: ['about', 'around', 'approximately', 'roughly'],
    uncertain: ['probably', 'likely', 'supposedly', 'allegedly'],
    placeholder: ['TODO', 'TBD', 'placeholder', 'example'],
    conflicting: ['actually', 'wait', 'correction', 'no that']
};

function analyzeStack(filename) {
    try {
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        
        console.log(`\n📊 ANALYZING: ${data.title || path.basename(filename)}`);
        console.log(`   File: ${filename}`);
        console.log(`   Questions: ${data.questions?.length || 0}`);

        if (!data.questions || data.questions.length === 0) {
            console.log('   ⚠️  No questions found in this stack\n');
            return { score: 0, warnings: ['No questions'] };
        }

        // Depth Analysis
        const depthMetrics = { foundation: 0, context: 0, insider: 0, expert: 0 };
        const accuracyIssues = [];
        const qualityFeatures = {
            explanations: 0,
            alternativeAnswers: 0,
            hints: 0,
            emptyAnswers: 0,
            shortAnswers: 0
        };

        data.questions.forEach((q, index) => {
            const level = q.level || index + 1;
            
            // Depth classification
            if (level <= 10) depthMetrics.foundation++;
            else if (level <= 20) depthMetrics.context++;
            else if (level <= 30) depthMetrics.insider++;
            else depthMetrics.expert++;

            // Quality features
            if (q.explanation) qualityFeatures.explanations++;
            if (q.alternative_answers) qualityFeatures.alternativeAnswers++;
            if (q.hint) qualityFeatures.hints++;

            // Accuracy checks
            if (!q.answer || q.answer.trim() === '') {
                qualityFeatures.emptyAnswers++;
                accuracyIssues.push(`Q${level}: Empty answer`);
            } else if (q.answer.length < 2) {
                qualityFeatures.shortAnswers++;
                accuracyIssues.push(`Q${level}: Very short answer (${q.answer})`);
            }

            // Check for accuracy warning words
            const fullText = `${q.question} ${q.answer} ${q.explanation || ''}`.toLowerCase();
            Object.entries(accuracyWarnings).forEach(([category, words]) => {
                words.forEach(word => {
                    if (fullText.includes(word)) {
                        accuracyIssues.push(`Q${level}: ${category.toUpperCase()} - "${word}"`);
                    }
                });
            });
        });

        // Quality Score Calculation
        let qualityScore = 0;
        
        // Depth distribution (30 points max)
        if (depthMetrics.expert >= 3) qualityScore += 15;
        if (depthMetrics.insider >= 5) qualityScore += 10;
        if (depthMetrics.foundation <= Math.ceil(data.questions.length * 0.4)) qualityScore += 5;
        
        // Content richness (40 points max)
        const explanationRatio = qualityFeatures.explanations / data.questions.length;
        qualityScore += Math.round(explanationRatio * 25);
        
        if (qualityFeatures.alternativeAnswers > 0) qualityScore += 10;
        if (qualityFeatures.hints > 0) qualityScore += 5;
        
        // Stack size (20 points max)
        if (data.questions.length >= 30) qualityScore += 20;
        else if (data.questions.length >= 20) qualityScore += 15;
        else if (data.questions.length >= 10) qualityScore += 10;
        else qualityScore += 5;

        // Accuracy penalties (10 points max deduction)
        qualityScore -= Math.min(10, qualityFeatures.emptyAnswers * 5);
        qualityScore -= Math.min(5, accuracyIssues.length);

        console.log(`   🎯 Depth: F:${depthMetrics.foundation} C:${depthMetrics.context} I:${depthMetrics.insider} E:${depthMetrics.expert}`);
        console.log(`   📝 Features: ${Math.round(explanationRatio*100)}% explanations, ${qualityFeatures.alternativeAnswers} alt answers, ${qualityFeatures.hints} hints`);
        
        if (accuracyIssues.length > 0) {
            console.log(`   ⚠️  Accuracy Issues (${accuracyIssues.length}):`);
            accuracyIssues.slice(0, 3).forEach(issue => console.log(`      - ${issue}`));
            if (accuracyIssues.length > 3) console.log(`      ... and ${accuracyIssues.length - 3} more`);
        }

        console.log(`   ⭐ Quality Score: ${qualityScore}/100`);
        
        if (qualityScore >= 90) console.log(`      🏆 EXCELLENT - Production ready`);
        else if (qualityScore >= 75) console.log(`      🥇 VERY GOOD - Minor improvements needed`);
        else if (qualityScore >= 60) console.log(`      🥈 GOOD - Needs depth enhancement`);
        else if (qualityScore >= 40) console.log(`      🥉 FAIR - Major improvements needed`);
        else console.log(`      ❌ POOR - Complete revision required`);

        return { score: qualityScore, warnings: accuracyIssues, data };

    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}\n`);
        return { score: 0, warnings: [`File error: ${error.message}`] };
    }
}

// Analyze all stacks
const results = [];
stackFiles.forEach(filename => {
    if (fs.existsSync(filename)) {
        results.push({ filename, ...analyzeStack(filename) });
    } else {
        console.log(`\n⚠️  MISSING: ${filename}`);
    }
});

// Summary Report
console.log('\n\n🎯 OVERALL QUALITY SUMMARY');
console.log('=' .repeat(50));

const scores = results.filter(r => r.score > 0).map(r => r.score);
if (scores.length > 0) {
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highScore = Math.max(...scores);
    const lowScore = Math.min(...scores);
    
    console.log(`📊 Quality Metrics:`);
    console.log(`   Average Score: ${avgScore}/100`);
    console.log(`   Best Stack: ${highScore}/100`);
    console.log(`   Needs Work: ${lowScore}/100`);
    console.log(`   Total Stacks: ${results.length}`);
    
    console.log(`\n🏆 TOP PERFORMERS:`);
    results
        .filter(r => r.score >= 80)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .forEach(r => {
            console.log(`   ${r.score}/100 - ${path.basename(r.filename)}`);
        });

    console.log(`\n⚠️  NEEDS ATTENTION:`);
    results
        .filter(r => r.score > 0 && r.score < 60)
        .sort((a, b) => a.score - b.score)
        .forEach(r => {
            console.log(`   ${r.score}/100 - ${path.basename(r.filename)} (${r.warnings.length} issues)`);
        });
}

console.log('\n' + '='.repeat(50));
console.log('🎯 ACCURACY ASSURANCE RECOMMENDATIONS:\n');
console.log('1. 🔍 FACT-CHECK PROTOCOL:');
console.log('   - Cross-reference all numerical data with primary sources');
console.log('   - Wikipedia + 2 additional authoritative sources minimum');
console.log('   - For sports: Official league records, team histories');
console.log('   - For history: Academic sources, museum databases\n');

console.log('2. 🤖 AUTOMATED ACCURACY CHECKS:');
console.log('   - Flag vague language ("about", "around")');
console.log('   - Detect conflicting information within explanations');
console.log('   - Validate date ranges and numerical consistency');
console.log('   - Check for placeholder content\n');

console.log('3. 🏗️ TOWARDS AUTONOMOUS GENERATION:');
console.log('   - Current: Manual curation with quality framework ✅');
console.log('   - Next: AI-assisted fact verification system');
console.log('   - Future: Fully autonomous with human oversight');
console.log('   - Vision preservation: Deep dive templates + scoring\n');
