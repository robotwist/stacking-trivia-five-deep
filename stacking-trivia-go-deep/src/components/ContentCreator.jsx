import React, { useState, useEffect } from 'react'
import './ContentCreator.css'
import { contentManager } from '../services/contentManager'

const QUESTION_TYPES = {
  text: 'Text Answer',
  multiple_choice: 'Multiple Choice',
  true_false: 'True/False',
  image: 'Image Question'
}

const CATEGORIES = {
  'arts-culture': 'Arts & Culture',
  'sports': 'Sports', 
  'science-technology': 'Science & Technology',
  'cinema': 'Cinema',
  'history': 'History',
  'actually': 'Actually (Misconceptions)',
  'pop-culture': 'Pop Culture',
  'kids-zone': 'Kids Zone',
  'super-stacks': 'Super Stacks'
}

const STACK_TEMPLATES = {
  basic: {
    name: 'Basic 5-Question Stack',
    questions: Array(5).fill(null).map((_, i) => ({
      level: i + 1,
      question_text: '',
      correct_answer: '',
      alternative_answers: [],
      question_type: 'text',
      hint: '',
      explanation: ''
    }))
  },
  deep: {
    name: 'Deep Dive (10 Questions)',
    questions: Array(10).fill(null).map((_, i) => ({
      level: i + 1,
      question_text: '',
      correct_answer: '',
      alternative_answers: [],
      question_type: 'text',
      hint: '',
      explanation: ''
    }))
  },
  quiz: {
    name: 'Multiple Choice Quiz',
    questions: Array(5).fill(null).map((_, i) => ({
      level: i + 1,
      question_text: '',
      correct_answer: '',
      multiple_choice_options: ['', '', '', ''],
      question_type: 'multiple_choice',
      hint: '',
      explanation: ''
    }))
  }
}

function ContentCreator({ onClose, userRole }) {
  const [step, setStep] = useState('template') // template, details, questions, review, publish
  const [stackData, setStackData] = useState({
    title: '',
    description: '',
    category: 'general',
    difficulty_level: 1,
    image_url: '',
    image_hint: '',
    tags: [],
    questions: [],
    is_published: false
  })
  const [currentTag, setCurrentTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const handleTemplateSelect = (templateKey) => {
    setStackData(prev => ({
      ...prev,
      questions: [...STACK_TEMPLATES[templateKey].questions]
    }))
    setStep('details')
  }

  const handleDetailsSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    
    if (!stackData.title.trim()) newErrors.title = 'Title is required'
    if (!stackData.description.trim()) newErrors.description = 'Description is required'
    if (!stackData.category) newErrors.category = 'Category is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    setStep('questions')
  }

  const updateQuestion = (index, field, value) => {
    setStackData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  const addAlternativeAnswer = (questionIndex) => {
    updateQuestion(questionIndex, 'alternative_answers', [
      ...stackData.questions[questionIndex].alternative_answers,
      ''
    ])
  }

  const updateAlternativeAnswer = (questionIndex, answerIndex, value) => {
    const newAlts = [...stackData.questions[questionIndex].alternative_answers]
    newAlts[answerIndex] = value
    updateQuestion(questionIndex, 'alternative_answers', newAlts)
  }

  const removeAlternativeAnswer = (questionIndex, answerIndex) => {
    const newAlts = stackData.questions[questionIndex].alternative_answers.filter((_, i) => i !== answerIndex)
    updateQuestion(questionIndex, 'alternative_answers', newAlts)
  }

  const addTag = () => {
    if (currentTag.trim() && !stackData.tags.includes(currentTag.trim())) {
      setStackData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setStackData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateQuestions = () => {
    const errors = {}
    stackData.questions.forEach((q, i) => {
      if (!q.question_text.trim()) {
        errors[`question_${i}_text`] = `Question ${i + 1} text is required`
      }
      if (!q.correct_answer.trim()) {
        errors[`question_${i}_answer`] = `Question ${i + 1} answer is required`
      }
      if (q.question_type === 'multiple_choice' && 
          (!q.multiple_choice_options || q.multiple_choice_options.filter(opt => opt.trim()).length < 2)) {
        errors[`question_${i}_options`] = `Question ${i + 1} needs at least 2 options`
      }
    })
    return errors
  }

  const handleQuestionsSubmit = () => {
    const questionErrors = validateQuestions()
    
    if (Object.keys(questionErrors).length > 0) {
      setErrors(questionErrors)
      return
    }
    
    setErrors({})
    setStep('review')
  }

  const saveStack = async (publish = false) => {
    setSaving(true)
    try {
      const response = await fetch('/api/stacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...stackData,
          is_published: publish
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save stack')
      }

      const result = await response.json()
      
      // Show success message or redirect
      onClose && onClose(result)
      
    } catch (error) {
      console.error('Save error:', error)
      setErrors({ save: error.message })
    } finally {
      setSaving(false)
    }
  }

  // UI Components for each step
  const renderTemplateSelection = () => (
    <div className="template-selection">
      <h2>Choose a Stack Template</h2>
      <div className="template-grid">
        {Object.entries(STACK_TEMPLATES).map(([key, template]) => (
          <button 
            key={key}
            className="template-card"
            onClick={() => handleTemplateSelect(key)}
          >
            <h3>{template.name}</h3>
            <p>{template.questions.length} questions</p>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStackDetails = () => (
    <form onSubmit={handleDetailsSubmit} className="stack-details">
      <h2>Stack Details</h2>
      
      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          value={stackData.title}
          onChange={(e) => setStackData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Van Gogh Masterpieces"
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-text">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={stackData.description}
          onChange={(e) => setStackData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="A deep dive into Vincent van Gogh's most famous paintings..."
          className={errors.description ? 'error' : ''}
          rows="3"
        />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category *</label>
          <select
            value={stackData.category}
            onChange={(e) => setStackData(prev => ({ ...prev, category: e.target.value }))}
            className={errors.category ? 'error' : ''}
          >
            {Object.entries(CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label>Difficulty</label>
          <select
            value={stackData.difficulty_level}
            onChange={(e) => setStackData(prev => ({ ...prev, difficulty_level: parseInt(e.target.value) }))}
          >
            {[1, 2, 3, 4, 5].map(level => (
              <option key={level} value={level}>Level {level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Header Image URL</label>
        <input
          type="url"
          value={stackData.image_url}
          onChange={(e) => setStackData(prev => ({ ...prev, image_url: e.target.value }))}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="form-group">
        <label>Image Hint</label>
        <input
          type="text"
          value={stackData.image_hint}
          onChange={(e) => setStackData(prev => ({ ...prev, image_hint: e.target.value }))}
          placeholder="A famous painting of swirling night sky..."
        />
      </div>

      <div className="form-group">
        <label>Tags</label>
        <div className="tag-input">
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag..."
          />
          <button type="button" onClick={addTag}>Add</button>
        </div>
        <div className="tags">
          {stackData.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => setStep('template')}>Back</button>
        <button type="submit">Next: Questions</button>
      </div>
    </form>
  )

  const renderQuestionEditor = () => (
    <div className="question-editor">
      <h2>Edit Questions</h2>
      <div className="questions-list">
        {stackData.questions.map((question, index) => (
          <div key={index} className="question-card">
            <h3>Question {index + 1}</h3>
            
            <div className="form-group">
              <label>Question Type</label>
              <select
                value={question.question_type}
                onChange={(e) => updateQuestion(index, 'question_type', e.target.value)}
              >
                {Object.entries(QUESTION_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Question Text *</label>
              <textarea
                value={question.question_text}
                onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                placeholder="Enter your question here..."
                rows="2"
                className={errors[`question_${index}_text`] ? 'error' : ''}
              />
              {errors[`question_${index}_text`] && (
                <span className="error-text">{errors[`question_${index}_text`]}</span>
              )}
            </div>

            {question.question_type === 'multiple_choice' ? (
              <div className="form-group">
                <label>Multiple Choice Options *</label>
                {(question.multiple_choice_options || ['', '', '', '']).map((option, optIndex) => (
                  <div key={optIndex} className="option-input">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(question.multiple_choice_options || ['', '', '', ''])]
                        newOptions[optIndex] = e.target.value
                        updateQuestion(index, 'multiple_choice_options', newOptions)
                      }}
                      placeholder={`Option ${optIndex + 1} ${optIndex === 0 ? '(correct answer)' : ''}`}
                    />
                  </div>
                ))}
                <div className="form-group">
                  <label>Correct Answer *</label>
                  <select
                    value={question.correct_answer}
                    onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                    className={errors[`question_${index}_answer`] ? 'error' : ''}
                  >
                    <option value="">Select correct option</option>
                    {(question.multiple_choice_options || []).map((option, optIndex) => (
                      option.trim() && <option key={optIndex} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Correct Answer *</label>
                <input
                  type="text"
                  value={question.correct_answer}
                  onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                  placeholder="The correct answer..."
                  className={errors[`question_${index}_answer`] ? 'error' : ''}
                />
                {errors[`question_${index}_answer`] && (
                  <span className="error-text">{errors[`question_${index}_answer`]}</span>
                )}
              </div>
            )}

            {question.question_type !== 'multiple_choice' && (
              <div className="form-group">
                <label>Alternative Answers (optional)</label>
                {(question.alternative_answers || []).map((alt, altIndex) => (
                  <div key={altIndex} className="alt-answer">
                    <input
                      type="text"
                      value={alt}
                      onChange={(e) => updateAlternativeAnswer(index, altIndex, e.target.value)}
                      placeholder="Alternative acceptable answer..."
                    />
                    <button
                      type="button"
                      onClick={() => removeAlternativeAnswer(index, altIndex)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addAlternativeAnswer(index)}
                  className="add-alt-btn"
                >
                  + Add Alternative Answer
                </button>
              </div>
            )}

            <div className="form-group">
              <label>Hint (optional)</label>
              <input
                type="text"
                value={question.hint || ''}
                onChange={(e) => updateQuestion(index, 'hint', e.target.value)}
                placeholder="A helpful hint for players..."
              />
            </div>

            <div className="form-group">
              <label>Explanation (optional)</label>
              <textarea
                value={question.explanation || ''}
                onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                placeholder="Explain the answer after they respond..."
                rows="2"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button onClick={() => setStep('details')}>Back</button>
        <button onClick={handleQuestionsSubmit}>Review Stack</button>
      </div>
    </div>
  )

  const handleTrash = async () => {
    try {
      // Slug mirrors backend creation: kebab-case title
      const slug = (stackData?.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      if (!slug) {
        setErrors({ save: 'Cannot trash: missing stack title' })
        return
      }
      await contentManager.trashStack(slug)
      onClose && onClose({ trashed: true, slug })
    } catch (e) {
      setErrors({ save: e?.message || 'Failed to trash stack' })
    }
  }

  const renderReview = () => (
    <div className="stack-review">
      <h2>Review Your Stack</h2>
      
      <div className="review-section">
        <h3>{stackData.title}</h3>
        <p><strong>Category:</strong> {CATEGORIES[stackData.category]}</p>
        <p><strong>Difficulty:</strong> Level {stackData.difficulty_level}</p>
        <p><strong>Description:</strong> {stackData.description}</p>
        {stackData.tags.length > 0 && (
          <p><strong>Tags:</strong> {stackData.tags.join(', ')}</p>
        )}
      </div>

      <div className="questions-preview">
        <h4>Questions ({stackData.questions.length})</h4>
        {stackData.questions.map((q, i) => (
          <div key={i} className="question-preview">
            <strong>Q{i + 1}:</strong> {q.question_text}
            <br />
            <strong>Answer:</strong> {q.correct_answer}
            {q.alternative_answers && q.alternative_answers.length > 0 && (
              <span> (also accepts: {q.alternative_answers.join(', ')})</span>
            )}
          </div>
        ))}
      </div>

      {errors.save && (
        <div className="error-message">
          Error saving stack: {errors.save}
        </div>
      )}

      <div className="form-actions">
        <button onClick={() => setStep('questions')}>Edit Questions</button>
        <button 
          onClick={() => saveStack(false)}
          disabled={saving}
          className="save-draft"
        >
          {saving ? 'Saving...' : 'Save as Draft'}
        </button>
        <button 
          onClick={() => saveStack(true)}
          disabled={saving}
          className="publish"
        >
          {saving ? 'Publishing...' : 'Publish Stack'}
        </button>
        <button
          type="button"
          onClick={handleTrash}
          className="danger"
          aria-label="Trash this stack"
          title="Move this stack to trash (soft delete)"
        >
          🗑️ Trash Stack
        </button>
      </div>
    </div>
  )

  return (
    <div className="content-creator">
      <div className="creator-header">
        <h1>Create New Trivia Stack</h1>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="step-indicator">
        {['template', 'details', 'questions', 'review'].map((stepName, i) => (
          <div 
            key={stepName}
            className={`step ${step === stepName ? 'active' : ''} ${
              ['template', 'details', 'questions', 'review'].indexOf(step) > i ? 'completed' : ''
            }`}
          >
            {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
          </div>
        ))}
      </div>

      <div className="creator-content">
        {step === 'template' && renderTemplateSelection()}
        {step === 'details' && renderStackDetails()}
        {step === 'questions' && renderQuestionEditor()}
        {step === 'review' && renderReview()}
      </div>
    </div>
  )
}

export default ContentCreator
