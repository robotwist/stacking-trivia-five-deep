import express from 'express';
import { createUser, getUserByUsername, getUserById } from '../database/postgres.js';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  verifyToken, 
  validateSignup, 
  validateLogin,
  authenticateToken 
} from '../utils/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    const validationErrors = validateSignup(username, email, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: validationErrors.join(', ') 
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const user = await createUser(username.trim(), email.trim(), passwordHash);

    // Generate token
    const token = generateToken(user.id, user.username);

    // Return user data (without password) and token
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        total_score: user.total_score,
        games_played: user.games_played,
        best_single_stack: user.best_single_stack,
        completed_stacks: user.completed_stacks,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Failed to create account. Please try again.' 
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    const validationErrors = validateLogin(username, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: validationErrors.join(', ') 
      });
    }

    // Get user from database
    const user = await getUserByUsername(username.trim());
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Generate token
    const token = generateToken(user.id, user.username);

    // Return user data (without password) and token
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        total_score: user.total_score,
        games_played: user.games_played,
        best_single_stack: user.best_single_stack,
        completed_stacks: user.completed_stacks,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

// GET /api/auth/verify
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // Get fresh user data
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
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
