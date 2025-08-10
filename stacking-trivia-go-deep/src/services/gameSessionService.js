// Game session management for persistent scoring
import { pool } from '../database/postgres.js'

export const createGameSession = async (userId, sessionType = 'single-player') => {
  try {
    const result = await pool.query(
      'INSERT INTO game_sessions (user_id, session_type) VALUES ($1, $2) RETURNING id',
      [userId, sessionType]
    )
    return result.rows[0].id
  } catch (error) {
    console.error('Error creating game session:', error)
    throw error
  }
}

export const updateGameSession = async (sessionId, totalScore, stacksCompleted, durationMinutes) => {
  try {
    await pool.query(
      `UPDATE game_sessions 
       SET total_score = $2, stacks_completed = $3, duration_minutes = $4, completed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [sessionId, totalScore, JSON.stringify(stacksCompleted), durationMinutes]
    )
  } catch (error) {
    console.error('Error updating game session:', error)
    throw error
  }
}

export const recordStackResult = async (sessionId, stackName, questionsAnswered, questionsCorrect, finalScore, deeperModeAttempted = false, deeperModeCompleted = false) => {
  try {
    await pool.query(
      `INSERT INTO stack_results 
       (session_id, stack_name, questions_answered, questions_correct, final_score, deeper_mode_attempted, deeper_mode_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sessionId, stackName, questionsAnswered, questionsCorrect, finalScore, deeperModeAttempted, deeperModeCompleted]
    )
  } catch (error) {
    console.error('Error recording stack result:', error)
    throw error
  }
}

export const getUserGameHistory = async (userId, limit = 10) => {
  try {
    const result = await pool.query(
      `SELECT gs.*, 
              COUNT(sr.id) as stacks_count,
              AVG(sr.final_score) as avg_stack_score
       FROM game_sessions gs
       LEFT JOIN stack_results sr ON gs.id = sr.session_id
       WHERE gs.user_id = $1
       GROUP BY gs.id
       ORDER BY gs.completed_at DESC
       LIMIT $2`,
      [userId, limit]
    )
    return result.rows
  } catch (error) {
    console.error('Error getting user game history:', error)
    throw error
  }
}

export const updateLeaderboard = async (userId, category, stackName, score) => {
  try {
    await pool.query(
      `INSERT INTO leaderboards (user_id, category, stack_name, score)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, stack_name)
       DO UPDATE SET 
         score = GREATEST(leaderboards.score, EXCLUDED.score),
         achieved_at = CASE 
           WHEN EXCLUDED.score > leaderboards.score THEN CURRENT_TIMESTAMP 
           ELSE leaderboards.achieved_at 
         END`,
      [userId, category, stackName, score]
    )
  } catch (error) {
    console.error('Error updating leaderboard:', error)
    throw error
  }
}

export const getLeaderboard = async (category = null, limit = 10) => {
  try {
    let query = `
      SELECT l.*, u.username 
      FROM leaderboards l
      JOIN users u ON l.user_id = u.id
    `
    let params = []
    
    if (category) {
      query += ` WHERE l.category = $1`
      params.push(category)
    }
    
    query += ` ORDER BY l.score DESC LIMIT $${params.length + 1}`
    params.push(limit)
    
    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    throw error
  }
}
