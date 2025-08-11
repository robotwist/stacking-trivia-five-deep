import express from 'express'
import { pool } from '../database/postgres.js'
import { authenticateToken } from '../utils/auth.js'

const router = express.Router()

// POST /api/feedback
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { stackTitle, rating, category, message, difficultyTag } = req.body
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) required' })
    }
    await pool.query(
      `INSERT INTO feedback (user_id, stack_title, rating, category, message, difficulty_tag)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.userId, stackTitle || null, rating, category || null, message || null, difficultyTag || null]
    )
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit feedback' })
  }
})

export default router


