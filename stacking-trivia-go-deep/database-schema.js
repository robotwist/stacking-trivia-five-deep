// Database Schema for DeepStack Scores

// Users Table
const userSchema = {
  id: 'uuid',
  username: 'string',
  email: 'string',
  created_at: 'timestamp',
  last_active: 'timestamp'
}

// Game Sessions Table
const sessionSchema = {
  id: 'uuid',
  user_id: 'uuid',
  session_type: 'single_player | multiplayer | tournament',
  total_score: 'integer',
  questions_answered: 'integer',
  correct_answers: 'integer',
  categories_completed: 'json',
  current_streak: 'integer',
  best_streak: 'integer',
  time_spent: 'integer', // seconds
  started_at: 'timestamp',
  completed_at: 'timestamp',
  status: 'active | completed | abandoned'
}

// Stack Results Table
const stackResultSchema = {
  id: 'uuid',
  session_id: 'uuid',
  stack_id: 'string',
  category: 'string',
  score: 'integer',
  questions_answered: 'integer',
  time_taken: 'integer',
  completed_at: 'timestamp'
}

// Leaderboards Table
const leaderboardSchema = {
  id: 'uuid',
  user_id: 'uuid',
  category: 'string',
  score: 'integer',
  stacks_completed: 'integer',
  streak: 'integer',
  achieved_at: 'timestamp',
  leaderboard_type: 'daily | weekly | monthly | all_time'
}

// Multiplayer Rooms Table
const roomSchema = {
  id: 'uuid',
  room_code: 'string', // 6-digit code
  host_user_id: 'uuid',
  max_players: 'integer',
  current_players: 'integer',
  game_mode: 'race | collaborative | tournament',
  selected_categories: 'json',
  status: 'waiting | active | completed',
  created_at: 'timestamp'
}

// Multiplayer Participants Table
const participantSchema = {
  id: 'uuid',
  room_id: 'uuid',
  user_id: 'uuid',
  score: 'integer',
  position: 'integer',
  joined_at: 'timestamp'
}
