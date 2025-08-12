import express from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../database/postgres.js'

const router = express.Router()

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Middleware to check content creation permissions
const requireCreatorRole = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role, permissions FROM user_roles WHERE user_id = $1',
      [req.user.userId]
    )

    if (result.rows.length === 0 || 
        !['creator', 'moderator', 'admin'].includes(result.rows[0].role)) {
      return res.status(403).json({ error: 'Creator permissions required' })
    }

    req.userRole = result.rows[0]
    next()
  } catch (error) {
    res.status(500).json({ error: 'Permission check failed' })
  }
}

// GET /api/stacks - List all published stacks
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, limit = 50, offset = 0 } = req.query
    
    let query = `
      SELECT s.*, 
             sc.display_name as category_name,
             COUNT(q.id) as question_count,
             u.username as creator_name
      FROM stacks s
      LEFT JOIN stack_categories sc ON s.category = sc.name
      LEFT JOIN questions q ON s.id = q.stack_id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.is_published = true AND s.is_trashed = false
    `
    
    const params = []
    let paramCount = 0
    
    if (category) {
      query += ` AND s.category = $${++paramCount}`
      params.push(category)
    }
    
    if (featured === 'true') {
      query += ` AND s.is_featured = true`
    }
    
    if (search) {
      query += ` AND (s.title ILIKE $${++paramCount} OR s.description ILIKE $${++paramCount})`
      params.push(`%${search}%`, `%${search}%`)
    }
    
    query += `
      GROUP BY s.id, sc.display_name, u.username
      ORDER BY s.is_featured DESC, s.updated_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `
    params.push(limit, offset)
    
    const result = await pool.query(query, params)
    
    res.json({
      stacks: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rowCount
      }
    })
  } catch (error) {
    console.error('Error fetching stacks:', error)
    res.status(500).json({ error: 'Failed to fetch stacks' })
  }
})

// GET /api/stacks/categories - List all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sc.*, COUNT(s.id) as stack_count
      FROM stack_categories sc
      LEFT JOIN stacks s ON sc.name = s.category AND s.is_published = true
      WHERE sc.is_active = true
      GROUP BY sc.id
      ORDER BY sc.sort_order, sc.display_name
    `)
    
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/stacks/:slug - Get specific stack with questions
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    
    // Get stack metadata
    const stackResult = await pool.query(`
      SELECT s.*, sc.display_name as category_name, u.username as creator_name
      FROM stacks s
      LEFT JOIN stack_categories sc ON s.category = sc.name
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.slug = $1 AND s.is_published = true AND s.is_trashed = false
    `, [slug])
    
    if (stackResult.rows.length === 0) {
      return res.status(404).json({ error: 'Stack not found' })
    }
    
    const stack = stackResult.rows[0]
    
    // Get questions
    const questionsResult = await pool.query(`
      SELECT id, level, question_text, question_type, correct_answer, 
             alternative_answers, multiple_choice_options, hint, 
             image_url, difficulty_modifier
      FROM questions
      WHERE stack_id = $1
      ORDER BY level
    `, [stack.id])
    
    stack.questions = questionsResult.rows
    
    res.json(stack)
  } catch (error) {
    console.error('Error fetching stack:', error)
    res.status(500).json({ error: 'Failed to fetch stack' })
  }
})

// POST /api/stacks - Create new stack
router.post('/', authenticateToken, requireCreatorRole, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty_level = 1,
      image_url,
      image_hint,
      tags = [],
      questions = [],
      is_published = false
    } = req.body
    
    // Validate required fields
    if (!title || !category || questions.length === 0) {
      return res.status(400).json({ 
        error: 'Title, category, and at least one question are required' 
      })
    }
    
    // Create URL-friendly slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    // Check if slug already exists
    const existingStack = await pool.query('SELECT id FROM stacks WHERE slug = $1', [slug])
    if (existingStack.rows.length > 0) {
      return res.status(400).json({ error: 'A stack with this title already exists' })
    }
    
    // Begin transaction
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      // Insert stack
      const stackResult = await client.query(`
        INSERT INTO stacks (slug, title, description, category, difficulty_level, 
                           image_url, image_hint, tags, is_published, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, slug, title, category, created_at
      `, [slug, title, description, category, difficulty_level, image_url, 
          image_hint, JSON.stringify(tags), is_published, req.user.userId])
      
      const stack = stackResult.rows[0]
      
      // Insert questions
      for (const question of questions) {
        await client.query(`
          INSERT INTO questions (stack_id, level, question_text, question_type,
                               correct_answer, alternative_answers, multiple_choice_options,
                               hint, image_url, difficulty_modifier, explanation)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          stack.id,
          question.level,
          question.question_text,
          question.question_type || 'text',
          question.correct_answer,
          JSON.stringify(question.alternative_answers || []),
          question.multiple_choice_options ? JSON.stringify(question.multiple_choice_options) : null,
          question.hint,
          question.image_url,
          question.difficulty_modifier || 1.0,
          question.explanation
        ])
      }
      
      await client.query('COMMIT')
      
      res.status(201).json({
        message: 'Stack created successfully',
        stack: {
          id: stack.id,
          slug: stack.slug,
          title: stack.title,
          category: stack.category,
          question_count: questions.length,
          is_published,
          created_at: stack.created_at
        }
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating stack:', error)
    res.status(500).json({ error: 'Failed to create stack' })
  }
})

// GET /api/stacks/my/drafts - Get user's draft stacks
router.get('/my/drafts', authenticateToken, requireCreatorRole, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, COUNT(q.id) as question_count
      FROM stacks s
      LEFT JOIN questions q ON s.id = q.stack_id
      WHERE s.created_by = $1 AND s.is_published = false
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `, [req.user.userId])
    
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching drafts:', error)
    res.status(500).json({ error: 'Failed to fetch drafts' })
  }
})

// POST /api/stacks/bulk-import - Import from JSON files
router.post('/bulk-import', authenticateToken, requireCreatorRole, async (req, res) => {
  try {
    const { stacks } = req.body
    
    if (!Array.isArray(stacks)) {
      return res.status(400).json({ error: 'Stacks must be an array' })
    }
    
    const results = []
    
    for (const stackData of stacks) {
      try {
        // Convert old format to new format
        const convertedStack = {
          title: stackData.title,
          description: stackData.description,
          category: stackData.category || 'general',
          image_url: stackData.image,
          image_hint: stackData.imageHint,
          tags: stackData.tags || [],
          questions: (stackData.questions || []).map((q, index) => ({
            level: q.level || index + 1,
            question_text: q.question || q.q,
            correct_answer: Array.isArray(q.answer) ? q.answer[0] : (q.answer || q.a),
            alternative_answers: Array.isArray(q.answer) ? q.answer.slice(1) : (Array.isArray(q.a) ? q.a.slice(1) : []),
            question_type: 'text',
            difficulty_modifier: 1.0
          })),
          is_published: true
        }
        
        // Create stack using existing endpoint logic
        const slug = convertedStack.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        // Check if already exists
        const existing = await pool.query('SELECT id FROM stacks WHERE slug = $1', [slug])
        if (existing.rows.length > 0) {
          results.push({ title: convertedStack.title, status: 'skipped', reason: 'Already exists' })
          continue
        }
        
        // Insert stack and questions (simplified version)
        const client = await pool.connect()
        try {
          await client.query('BEGIN')
          
          const stackResult = await client.query(`
            INSERT INTO stacks (slug, title, description, category, image_url, image_hint, 
                               tags, is_published, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
          `, [slug, convertedStack.title, convertedStack.description, 
              convertedStack.category, convertedStack.image_url, convertedStack.image_hint,
              JSON.stringify(convertedStack.tags), true, req.user.userId])
          
          const stackId = stackResult.rows[0].id
          
          for (const question of convertedStack.questions) {
            await client.query(`
              INSERT INTO questions (stack_id, level, question_text, correct_answer, alternative_answers)
              VALUES ($1, $2, $3, $4, $5)
            `, [stackId, question.level, question.question_text, question.correct_answer, 
                JSON.stringify(question.alternative_answers)])
          }
          
          await client.query('COMMIT')
          results.push({ title: convertedStack.title, status: 'imported', questions: convertedStack.questions.length })
        } catch (error) {
          await client.query('ROLLBACK')
          results.push({ title: convertedStack.title, status: 'error', error: error.message })
        } finally {
          client.release()
        }
      } catch (error) {
        results.push({ title: stackData.title || 'Unknown', status: 'error', error: error.message })
      }
    }
    
    res.json({
      message: `Bulk import completed`,
      results,
      summary: {
        imported: results.filter(r => r.status === 'imported').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        errors: results.filter(r => r.status === 'error').length
      }
    })
  } catch (error) {
    console.error('Error in bulk import:', error)
    res.status(500).json({ error: 'Bulk import failed' })
  }
})

export default router

// Admin/creator soft-delete (trash) endpoint
router.post('/:slug/trash', authenticateToken, requireCreatorRole, async (req, res) => {
  try {
    const { slug } = req.params
    const result = await pool.query('UPDATE stacks SET is_trashed = true, is_published = false WHERE slug = $1 RETURNING id, slug, title', [slug])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Stack not found' })
    res.json({ message: 'Stack trashed', stack: result.rows[0] })
  } catch (e) {
    res.status(500).json({ error: 'Failed to trash stack' })
  }
})
