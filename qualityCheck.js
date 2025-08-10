// Simple quality analysis for Nebraska stack
const fs = require('fs');

console.log('🔍 Analyzing Nebraska Sports Ultimate Stack Quality...\n');

try {
    const data = JSON.parse(fs.readFileSync('./nebraska-sports-ultimate.json', 'utf8'));
    
    console.log(`📊 STACK OVERVIEW:`);
    console.log(`   Title: ${data.title}`);
    console.log(`   Total Questions: ${data.questions.length}`);
    console.log(`   Difficulty Level: ${data.difficulty_level}/5`);
    console.log(`   Categories: ${data.tags.join(', ')}\n`);

    // Depth Analysis
    const depthMetrics = {
        foundation: 0,    // Levels 1-10: Basic facts
        context: 0,       // Levels 11-20: Context/history
        insider: 0,       // Levels 21-30: Insider knowledge
        expert: 0         // Levels 31+: Expert/obscure
    };

    const complexFeatures = {
        explanations: 0,
        alternativeAnswers: 0,
        hints: 0,
        multiSport: new Set()
    };

    data.questions.forEach(q => {
        // Depth tier classification
        if (q.level <= 10) depthMetrics.foundation++;
        else if (q.level <= 20) depthMetrics.context++;
        else if (q.level <= 30) depthMetrics.insider++;
        else depthMetrics.expert++;

        // Feature analysis
        if (q.explanation) complexFeatures.explanations++;
        if (q.alternative_answers) complexFeatures.alternativeAnswers++;
        if (q.hint) complexFeatures.hints++;

        // Sport detection
        const questionText = (q.question + ' ' + q.answer).toLowerCase();
        if (questionText.includes('volleyball')) complexFeatures.multiSport.add('volleyball');
        if (questionText.includes('football') || questionText.includes('quarterback') || questionText.includes('rushing')) complexFeatures.multiSport.add('football');
        if (questionText.includes('basketball')) complexFeatures.multiSport.add('basketball');
    });

    console.log(`🎯 DEPTH PROGRESSION ANALYSIS:`);
    console.log(`   Foundation (Levels 1-10):  ${depthMetrics.foundation} questions`);
    console.log(`   Context (Levels 11-20):    ${depthMetrics.context} questions`);
    console.log(`   Insider (Levels 21-30):    ${depthMetrics.insider} questions`);
    console.log(`   Expert (Levels 31+):       ${depthMetrics.expert} questions\n`);

    console.log(`📝 CONTENT RICHNESS:`);
    console.log(`   Questions with explanations: ${complexFeatures.explanations}/${data.questions.length} (${Math.round(complexFeatures.explanations/data.questions.length*100)}%)`);
    console.log(`   Questions with alt answers:  ${complexFeatures.alternativeAnswers}/${data.questions.length} (${Math.round(complexFeatures.alternativeAnswers/data.questions.length*100)}%)`);
    console.log(`   Questions with hints:        ${complexFeatures.hints}/${data.questions.length} (${Math.round(complexFeatures.hints/data.questions.length*100)}%)`);
    console.log(`   Sports covered:              ${Array.from(complexFeatures.multiSport).join(', ')}\n`);

    // Quality Score Calculation
    let qualityScore = 0;
    
    // Depth distribution (max 30 points)
    if (depthMetrics.expert >= 5) qualityScore += 10; // Has deep expert questions
    if (depthMetrics.insider >= 10) qualityScore += 10; // Good insider knowledge
    if (depthMetrics.foundation <= 10) qualityScore += 10; // Not too many basic questions
    
    // Content richness (max 40 points)
    qualityScore += Math.min(20, complexFeatures.explanations); // Up to 20 for explanations
    qualityScore += Math.min(10, complexFeatures.alternativeAnswers); // Up to 10 for alt answers
    qualityScore += complexFeatures.multiSport.size * 5; // 5 points per sport

    // Stack size bonus (max 30 points)
    if (data.questions.length >= 35) qualityScore += 30;
    else if (data.questions.length >= 30) qualityScore += 25;
    else if (data.questions.length >= 25) qualityScore += 20;

    console.log(`⭐ QUALITY SCORE: ${qualityScore}/100`);
    
    if (qualityScore >= 90) console.log(`   🏆 EXCELLENT - True deep dive stack!`);
    else if (qualityScore >= 75) console.log(`   🥇 VERY GOOD - Strong depth progression`);
    else if (qualityScore >= 60) console.log(`   🥈 GOOD - Decent depth but could go deeper`);
    else console.log(`   🥉 NEEDS WORK - More depth required`);

    // Sample deep questions
    console.log(`\n🔬 SAMPLE DEEP DIVE QUESTIONS:`);
    const deepQuestions = data.questions.filter(q => q.level >= 25).slice(0, 3);
    deepQuestions.forEach(q => {
        console.log(`   Level ${q.level}: ${q.question}`);
        console.log(`   Answer: ${q.answer}`);
        if (q.explanation) console.log(`   Why: ${q.explanation.substring(0, 100)}...`);
        console.log('');
    });

} catch (error) {
    console.error('❌ Error analyzing stack:', error.message);
}
