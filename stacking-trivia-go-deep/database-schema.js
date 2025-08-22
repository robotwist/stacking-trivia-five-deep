// Database schema definitions for DeepStack Trivia

// User schema
const _userSchema = {
  id: 'SERIAL PRIMARY KEY',
  username: 'VARCHAR(50) UNIQUE NOT NULL',
  email: 'VARCHAR(100) UNIQUE NOT NULL',
  password_hash: 'VARCHAR(255) NOT NULL',
  total_score: 'INTEGER DEFAULT 0',
  games_played: 'INTEGER DEFAULT 0',
  current_streak: 'INTEGER DEFAULT 0',
  correct_answers: 'INTEGER DEFAULT 0',
  total_questions: 'INTEGER DEFAULT 0',
  global_rank: 'INTEGER',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

// Session schema
const _sessionSchema = {
  id: 'SERIAL PRIMARY KEY',
  user_id: 'INTEGER REFERENCES users(id)',
  token: 'VARCHAR(255) UNIQUE NOT NULL',
  expires_at: 'TIMESTAMP NOT NULL',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

// Stack result schema
const _stackResultSchema = {
  id: 'SERIAL PRIMARY KEY',
  user_id: 'INTEGER REFERENCES users(id)',
  stack_key: 'VARCHAR(100) NOT NULL',
  score: 'INTEGER NOT NULL',
  max_possible_score: 'INTEGER NOT NULL',
  questions_answered: 'INTEGER NOT NULL',
  correct_answers: 'INTEGER NOT NULL',
  time_taken: 'INTEGER', // in seconds
  completed_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  difficulty_level: 'VARCHAR(20)',
  depth_focus_score: 'DECIMAL(3,2)'
};

// Leaderboard schema
const _leaderboardSchema = {
  id: 'SERIAL PRIMARY KEY',
  user_id: 'INTEGER REFERENCES users(id)',
  username: 'VARCHAR(50) NOT NULL',
  total_score: 'INTEGER NOT NULL',
  games_played: 'INTEGER NOT NULL',
  average_score: 'DECIMAL(10,2)',
  global_rank: 'INTEGER',
  last_updated: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

// Room schema for multiplayer
const _roomSchema = {
  id: 'SERIAL PRIMARY KEY',
  room_code: 'VARCHAR(10) UNIQUE NOT NULL',
  host_id: 'INTEGER REFERENCES users(id)',
  status: 'VARCHAR(20) DEFAULT "waiting"', // waiting, active, completed
  current_stack: 'VARCHAR(100)',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  started_at: 'TIMESTAMP',
  ended_at: 'TIMESTAMP'
};

// Participant schema for multiplayer
const _participantSchema = {
  id: 'SERIAL PRIMARY KEY',
  room_id: 'INTEGER REFERENCES rooms(id)',
  user_id: 'INTEGER REFERENCES users(id)',
  username: 'VARCHAR(50) NOT NULL',
  score: 'INTEGER DEFAULT 0',
  joined_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  left_at: 'TIMESTAMP'
};
