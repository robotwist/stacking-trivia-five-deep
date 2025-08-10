/**
 * Local JSON-to-Database Import Tool
 * Creates the ultimate Nebraska stack in your existing working database
 */

import fs from 'fs';

// For now, let's just create enhanced JSON files that your app can load directly
// Once we get the database working, we can migrate these easily

async function createEnhancedNebraskaStack() {
  console.log('🏈 Creating Ultimate Nebraska Sports Stack for your family!\n');

  const nebraskaData = JSON.parse(fs.readFileSync('../nebraska-sports-ultimate.json', 'utf8'));
  
  console.log(`📊 Stack Details:`);
  console.log(`   📚 Title: ${nebraskaData.title}`);
  console.log(`   📝 Questions: ${nebraskaData.questions.length}`);
  console.log(`   🎯 Category: ${nebraskaData.category}`);
  console.log(`   ⭐ Difficulty: Level ${nebraskaData.difficulty_level}`);
  console.log(`   🏷️  Tags: ${nebraskaData.tags.join(', ')}\n`);

  // Convert to the format your app expects
  const appFormatStack = {
    title: nebraskaData.title,
    image: nebraskaData.image,
    imageHint: nebraskaData.imageHint, 
    description: nebraskaData.description,
    questions: nebraskaData.questions.map((q, index) => ({
      level: q.level || index + 1,
      question: q.question,
      answer: q.answer,
      // Include alternative answers if they exist
      ...(q.alternative_answers && q.alternative_answers.length > 0 && {
        alternativeAnswers: q.alternative_answers
      }),
      ...(q.hint && { hint: q.hint }),
      ...(q.explanation && { explanation: q.explanation })
    }))
  };

  // Save in the format your current app can load
  const outputPath = '../src/data/categories/sports/nebraska-sports-ultimate.json';
  
  // Create directory if it doesn't exist
  const dirPath = '../src/data/categories/sports';
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log('📁 Created sports category directory');
  }

  fs.writeFileSync(outputPath, JSON.stringify(appFormatStack, null, 2));
  
  console.log(`✅ Ultimate Nebraska stack saved to: ${outputPath}`);
  console.log(`\n🎮 Your family can now play:`);
  console.log(`   🏈 35 deep Nebraska sports questions`);
  console.log(`   🏐 Football AND volleyball coverage`);
  console.log(`   🏟️ Memorial Stadium traditions`);
  console.log(`   📊 Records, stats, and legendary moments`);
  console.log(`   🎯 Progressive difficulty from easy to expert\n`);

  console.log(`🚀 Next Steps:`);
  console.log(`   1. Import this stack in App.jsx:`);
  console.log(`      import nebraskaUltimateData from './data/categories/sports/nebraska-sports-ultimate.json'`);
  console.log(`   2. Add to gameStacks object:`);
  console.log(`      'nebraska-sports-ultimate': nebraskaUltimateData,`);
  console.log(`   3. Deploy and let your family test their Nebraska knowledge!\n`);

  // Show a sample of the questions
  console.log(`🎯 Question Preview (first 5 of ${appFormatStack.questions.length}):`);
  appFormatStack.questions.slice(0, 5).forEach((q, i) => {
    console.log(`   ${i + 1}. ${q.question}`);
    console.log(`      Answer: ${q.answer}`);
    if (q.hint) console.log(`      Hint: ${q.hint}`);
    console.log('');
  });

  console.log(`   ... and ${appFormatStack.questions.length - 5} more challenging questions!`);
  
  // Create instructions file
  const instructionsPath = '../NEBRASKA_STACK_SETUP.md';
  const instructions = `# 🏈 Ultimate Nebraska Sports Stack Setup

## What You Got
- **35 comprehensive questions** covering Nebraska sports history
- **Progressive difficulty** from basic to expert level  
- **Football focus** with volleyball, traditions, and legendary moments
- **Family-friendly** content that will challenge even die-hard fans

## Quick Setup (5 minutes)

1. **Add to App.jsx imports:**
\`\`\`javascript
import nebraskaUltimateData from './data/categories/sports/nebraska-sports-ultimate.json'
\`\`\`

2. **Add to gameStacks object:**
\`\`\`javascript
const gameStacks = useMemo(() => ({
  // ... existing stacks
  'nebraska-sports-ultimate': nebraskaUltimateData,
  // ... rest of stacks
}), [])
\`\`\`

3. **Deploy and test!**

## Question Highlights
- Memorial Stadium capacity and traditions
- Heisman Trophy winners (Eric Crouch, Mike Rozier)
- Tom Osborne's championship years
- Volleyball championship history
- The famous sellout streak (375 games!)
- Nebraska-Oklahoma rivalry details
- Current Big Ten era facts

## Future Database Migration
When ready, use the content management system to:
- Import this stack to PostgreSQL database
- Enable web-based editing
- Add more stacks without code changes
- Support community contributions

Your family is going to love this deep dive into Nebraska sports history! 🌽🏈
`;

  fs.writeFileSync(instructionsPath, instructions);
  console.log(`📖 Setup instructions saved to: NEBRASKA_STACK_SETUP.md\n`);

  return appFormatStack;
}

// Create the stack
createEnhancedNebraskaStack().then(() => {
  console.log('🎉 Nebraska Sports Ultimate Stack ready for your family!');
}).catch(error => {
  console.error('Error:', error);
});
