import express from 'express';
import { getUserById, updateUserCompletedStack, saveGameSession } from '../database/postgres.js';
import { authenticateToken } from '../utils/auth.js';

const router = express.Router();

// GET /api/user/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        total_score: user.total_score,
        games_played: user.games_played,
        best_single_stack: user.best_single_stack,
        completed_stacks: user.completed_stacks,
        achievements: user.achievements,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/user/completed-stacks
router.get('/completed-stacks', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      completedStacks: user.completed_stacks || []
    });

  } catch (error) {
    console.error('Get completed stacks error:', error);
    res.status(500).json({ error: 'Failed to fetch completed stacks' });
  }
});

// POST /api/user/complete-stack
router.post('/complete-stack', authenticateToken, async (req, res) => {
  try {
    const { stackName, score } = req.body;

    if (!stackName || typeof score !== 'number' || score < 0) {
      return res.status(400).json({ 
        error: 'Valid stack name and score are required' 
      });
    }

    // Update user's completed stacks and stats
    const updatedUser = await updateUserCompletedStack(req.user.userId, stackName, score);

    // Save game session record
    await saveGameSession(
      req.user.userId,
      'single-player',
      score,
      [{ stackName, score }],
      null // duration not tracked yet
    );

    res.json({
      message: 'Stack completion recorded',
      user: updatedUser
    });

  } catch (error) {
    console.error('Complete stack error:', error);
    res.status(500).json({ error: 'Failed to record stack completion' });
  }
});

// GET /api/user/available-stacks
router.get('/available-stacks', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all available stack files
    const fs = await import('fs/promises');
    const path = await import('path');
    const stacksDir = path.resolve(process.cwd(), 'src/stacks');
    const rootStacks = path.resolve(process.cwd());

    let allStacks = [];

    try {
      // Get stacks from src/stacks directory
      const stackFiles = await fs.readdir(stacksDir);
      const stacksFromDir = stackFiles
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
      allStacks = allStacks.concat(stacksFromDir);
    } catch (err) {
      // Directory might not exist
    }

    try {
      // Get stacks from root directory
      const rootFiles = await fs.readdir(rootStacks);
      const stacksFromRoot = rootFiles
        .filter(file => file.endsWith('.json') && !file.includes('package'))
        .map(file => file.replace('.json', ''));
      allStacks = allStacks.concat(stacksFromRoot);
    } catch (err) {
      // Handle error
    }

    // Remove duplicates
    allStacks = [...new Set(allStacks)];

    const completedStacks = user.completed_stacks || [];
    const availableStacks = allStacks.filter(stack => !completedStacks.includes(stack));

    res.json({
      availableStacks,
      completedStacks,
      totalStacks: allStacks.length
    });

  } catch (error) {
    console.error('Get available stacks error:', error);
    res.status(500).json({ error: 'Failed to fetch available stacks' });
  }
});

export default router;

// Achievements persistence (create/update)
router.post('/achievements', authenticateToken, async (req, res) => {
  try {
    const { achievements } = req.body
    if (!Array.isArray(achievements)) return res.status(400).json({ error: 'Achievements must be an array' })
    const { pool } = await import('../database/postgres.js')
    const result = await pool.query(
      'UPDATE users SET achievements = $1 WHERE id = $2 RETURNING id, achievements',
      [JSON.stringify(achievements), req.user.userId]
    )
    res.json({ user: result.rows[0] })
  } catch (e) {
    res.status(500).json({ error: 'Failed to save achievements' })
  }
})
