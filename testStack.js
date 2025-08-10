// Test individual stack quality
const fs = require('fs');

if (process.argv.length < 3) {
    console.log('Usage: node testStack.js <path-to-json-file>');
    process.exit(1);
}

const filename = process.argv[2];

console.log(`🔍 Testing Quality: ${filename}\n`);

try {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    
    console.log(`📊 STACK OVERVIEW:`);
    console.log(`   Title: ${data.title}`);
    console.log(`   Total Questions: ${data.questions.length}`);
    console.log(`   Difficulty Level: ${data.difficulty_level || 'Not specified'}`);
    
    // Depth Analysis
    const depthMetrics = { foundation: 0, context: 0, insider: 0, expert: 0 };
    const accuracyIssues = [];
    const qualityFeatures = {
        explanations: 0,
        alternativeAnswers: 0,
        hints: 0,
        emptyAnswers: 0
    };

    data.questions.forEach((q, index) => {
        const level = q.level || index + 1;
        
        if (level <= 10) depthMetrics.foundation++;
        else if (level <= 20) depthMetrics.context++;
        else if (level <= 30) depthMetrics.insider++;
        else depthMetrics.expert++;

        if (q.explanation) qualityFeatures.explanations++;
        if (q.alternative_answers) qualityFeatures.alternativeAnswers++;
        if (q.hint) qualityFeatures.hints++;
        if (!q.answer || q.answer.trim() === '') {
            qualityFeatures.emptyAnswers++;
            accuracyIssues.push(`Q${level}: Empty answer`);
        }
    });

    // Quality Score Calculation (same as main analyzer)
    let qualityScore = 0;
    
    if (depthMetrics.expert >= 3) qualityScore += 15;
    if (depthMetrics.insider >= 5) qualityScore += 10;
    if (depthMetrics.foundation <= Math.ceil(data.questions.length * 0.4)) qualityScore += 5;
    
    const explanationRatio = qualityFeatures.explanations / data.questions.length;
    qualityScore += Math.round(explanationRatio * 25);
    
    if (qualityFeatures.alternativeAnswers > 0) qualityScore += 10;
    if (qualityFeatures.hints > 0) qualityScore += 5;
    
    if (data.questions.length >= 30) qualityScore += 20;
    else if (data.questions.length >= 20) qualityScore += 15;
    else if (data.questions.length >= 10) qualityScore += 10;
    else qualityScore += 5;

    qualityScore -= Math.min(10, qualityFeatures.emptyAnswers * 5);

    console.log(`\n🎯 DEPTH PROGRESSION:`);
    console.log(`   Foundation (1-10):   ${depthMetrics.foundation} questions`);
    console.log(`   Context (11-20):     ${depthMetrics.context} questions`);
    console.log(`   Insider (21-30):     ${depthMetrics.insider} questions`);
    console.log(`   Expert (31+):        ${depthMetrics.expert} questions`);

    console.log(`\n📝 CONTENT RICHNESS:`);
    console.log(`   Questions with explanations: ${qualityFeatures.explanations}/${data.questions.length} (${Math.round(explanationRatio*100)}%)`);
    console.log(`   Questions with alt answers:  ${qualityFeatures.alternativeAnswers}/${data.questions.length} (${Math.round(qualityFeatures.alternativeAnswers/data.questions.length*100)}%)`);
    console.log(`   Questions with hints:        ${qualityFeatures.hints}/${data.questions.length} (${Math.round(qualityFeatures.hints/data.questions.length*100)}%)`);

    console.log(`\n⭐ QUALITY SCORE: ${qualityScore}/100`);
    
    if (qualityScore >= 90) console.log(`   🏆 EXCELLENT - Production ready`);
    else if (qualityScore >= 75) console.log(`   🥇 VERY GOOD - Minor improvements needed`);
    else if (qualityScore >= 60) console.log(`   🥈 GOOD - Needs depth enhancement`);
    else if (qualityScore >= 40) console.log(`   🥉 FAIR - Major improvements needed`);
    else console.log(`   ❌ POOR - Complete revision required`);

    if (accuracyIssues.length > 0) {
        console.log(`\n⚠️  Issues to fix: ${accuracyIssues.length}`);
        accuracyIssues.forEach(issue => console.log(`   - ${issue}`));
    }

} catch (error) {
    console.error('Error:', error.message);
}
