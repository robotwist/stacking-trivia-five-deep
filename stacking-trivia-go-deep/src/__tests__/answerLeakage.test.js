import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

// Helper function to check if an answer appears in a question or category
const checkAnswerLeakage = (stackData) => {
  const issues = []
  const stackTitle = stackData.title?.toLowerCase() || ''
  
  stackData.questions?.forEach((question, index) => {
    // Handle different field names for questions
    const questionText = (question.q || question.question || '')?.toLowerCase()
    
    // Handle different field names for answers  
    let answers = []
    if (Array.isArray(question.a)) {
      answers = question.a
    } else if (Array.isArray(question.acceptedAnswers)) {
      answers = question.acceptedAnswers
    } else if (question.answer) {
      answers = [question.answer]
    }
    
    answers.forEach(answer => {
      const answerLower = answer?.toLowerCase() || ''
      
      // Check if answer appears in the question text
      if (questionText.includes(answerLower)) {
        issues.push({
          question: index + 1,
          type: 'answer_in_question',
          message: `Answer "${answer}" appears in question: "${question.q || question.question}"`
        })
      }
      
      // Check if answer appears in stack title/category
      if (stackTitle.includes(answerLower)) {
        issues.push({
          question: index + 1,
          type: 'answer_in_title',
          message: `Answer "${answer}" appears in stack title: "${stackData.title}"`
        })
      }
    })
  })
  
  return issues
}

// Read all JSON files in the project
const getStackFiles = () => {
  const projectRoot = path.resolve(process.cwd(), '..')
  const files = []
  
  try {
    const items = fs.readdirSync(projectRoot)
    items.forEach(item => {
      if (item.endsWith('.json') && !item.includes('package')) {
        const filePath = path.join(projectRoot, item)
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
          if (content.questions && content.title) {
            files.push({ name: item, path: filePath, data: content })
          }
        } catch (err) {
          // Skip invalid JSON files
        }
      }
    })
  } catch (err) {
    // Directory doesn't exist or can't be read
  }
  
  return files
}

describe('Answer Leakage Detection', () => {
  const stackFiles = getStackFiles()
  
  if (stackFiles.length === 0) {
    it('should find stack files to test', () => {
      expect(stackFiles.length).toBeGreaterThan(0)
    })
  } else {
    stackFiles.forEach(({ name, data }) => {
      describe(`Stack: ${name}`, () => {
        it('should not have answers that appear in questions', () => {
          const issues = checkAnswerLeakage(data)
          const questionIssues = issues.filter(issue => issue.type === 'answer_in_question')
          
          if (questionIssues.length > 0) {
            console.warn(`❌ Answer leakage found in ${name}:`)
            questionIssues.forEach(issue => {
              console.warn(`  - Question ${issue.question}: ${issue.message}`)
            })
          }
          
          expect(questionIssues).toHaveLength(0)
        })
        
        it('should not have answers that appear in stack title', () => {
          const issues = checkAnswerLeakage(data)
          const titleIssues = issues.filter(issue => issue.type === 'answer_in_title')
          
          if (titleIssues.length > 0) {
            console.warn(`❌ Title leakage found in ${name}:`)
            titleIssues.forEach(issue => {
              console.warn(`  - Question ${issue.question}: ${issue.message}`)
            })
          }
          
          expect(titleIssues).toHaveLength(0)
        })
        
        it('should have proper question structure', () => {
          expect(data.title).toBeDefined()
          expect(data.questions).toBeDefined()
          expect(Array.isArray(data.questions)).toBe(true)
          expect(data.questions.length).toBeGreaterThan(0)
          
          data.questions.forEach((question, index) => {
            // Handle different field names for questions
            const questionText = question.q || question.question
            expect(questionText, `Question ${index + 1} should have a question text`).toBeDefined()
            
            // Handle different field names for answers
            const answers = question.a || question.acceptedAnswers || question.answer
            expect(answers, `Question ${index + 1} should have answers`).toBeDefined()
          })
        })
      })
    })
  }
})
