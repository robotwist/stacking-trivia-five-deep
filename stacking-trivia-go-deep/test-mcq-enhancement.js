// Test script for enhanced MCQ generation
import { generateMultipleChoiceOptions } from './src/utils/mcq.js'

// Sample stack data for testing
const testStack = {
  title: "Famous Redheads (Women)",
  questions: [
    { q: "Comedy legend who starred in 'I Love Lucy'", a: ["lucille ball"] },
    { q: "Oscar-winning actress known for 'Still Alice' and 'Far from Heaven'", a: ["julianne moore"] },
    { q: "Australian star of 'Moulin Rouge!' and 'The Hours'", a: ["nicole kidman"] },
    { q: "Academy Award winner for 'The Eyes of Tammy Faye'", a: ["jessica chastain"] },
    { q: "Star of 'La La Land' and 'Easy A'", a: ["emma stone"] },
    { q: "'Will & Grace' actress who played Grace Adler", a: ["debra messing"] },
    { q: "Scottish singer of 'Dog Days Are Over' (Florence + The Machine)", a: ["florence welch"] },
    { q: "Singer nicknamed the 'Queen of Country' behind 'Fancy'", a: ["reba mcentire"] },
    { q: "'Mad Men' actress who played Joan Holloway", a: ["christina hendricks"] },
    { q: "'Sex and the City' actress who played Miranda Hobbes", a: ["cynthia nixon"] }
  ]
}

console.log("🧪 Testing Enhanced MCQ Generation")
console.log("=" * 50)

// Test each question
testStack.questions.forEach((question, index) => {
  console.log(`\n📝 Question ${index + 1}: ${question.q}`)
  console.log(`✅ Correct: ${question.a[0]}`)
  
  const options = generateMultipleChoiceOptions(testStack, index, 4)
  console.log("🎯 Generated Options:")
  options.forEach((option, optIndex) => {
    const marker = option.toLowerCase() === question.a[0].toLowerCase() ? "✅" : "❌"
    console.log(`   ${optIndex + 1}. ${marker} ${option}`)
  })
  
  console.log("-".repeat(40))
})

console.log("\n🎉 Enhanced MCQ Generation Test Complete!")
console.log("\nKey Improvements:")
console.log("• Semantic proximity matching")
console.log("• Common misconception detection") 
console.log("• Partial knowledge identification")
console.log("• Type-aware distractor generation")
console.log("• Cognitive level matching")
