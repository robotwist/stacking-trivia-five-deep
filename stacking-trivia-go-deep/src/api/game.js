import express from 'express'
import jwt from 'jsonwebtoken'
import { 
  createGameSession, 
  updateGameSession, 
  recordStackResult, 
  getUserGameHistory, 
  updateLeaderboard, 
  getLeaderboard 
} from '../services/gameSessionService.js'

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

// Create a new game session
router.post('/session', authenticateToken, async (req, res) => {
  try {
    const { sessionType = 'single-player' } = req.body
    const sessionId = await createGameSession(req.user.id, sessionType)
    res.json({ sessionId })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game session' })
  }
})

// Update game session with final results
router.put('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    const { totalScore, stacksCompleted, durationMinutes } = req.body
    
    await updateGameSession(sessionId, totalScore, stacksCompleted, durationMinutes)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update game session' })
  }
})

// Record individual stack result
router.post('/session/:sessionId/stack', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    const { 
      stackName, 
      questionsAnswered, 
      questionsCorrect, 
      finalScore, 
      deeperModeAttempted = false, 
      deeperModeCompleted = false,
      category 
    } = req.body
    
    await recordStackResult(
      sessionId, 
      stackName, 
      questionsAnswered, 
      questionsCorrect, 
      finalScore, 
      deeperModeAttempted, 
      deeperModeCompleted
    )
    
    // Update leaderboard
    if (category) {
      await updateLeaderboard(req.user.id, category, stackName, finalScore)
    }
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to record stack result' })
  }
})

// Get user's game history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const history = await getUserGameHistory(req.user.id, parseInt(limit))
    res.json({ history })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get game history' })
  }
})

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query
    const leaderboard = await getLeaderboard(category, parseInt(limit))
    res.json({ leaderboard })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard' })
  }
})

// Get user stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const history = await getUserGameHistory(req.user.id, 100) // Get more for stats
    
    const stats = {
      totalGames: history.length,
      totalScore: history.reduce((sum, game) => sum + (game.total_score || 0), 0),
      averageScore: history.length > 0 ? 
        Math.round(history.reduce((sum, game) => sum + (game.total_score || 0), 0) / history.length) : 0,
      bestGame: history.length > 0 ? Math.max(...history.map(game => game.total_score || 0)) : 0,
      totalStacksCompleted: history.reduce((sum, game) => sum + (game.stacks_count || 0), 0)
    }
    
    res.json({ stats })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user stats' })
  }
})

export default router
