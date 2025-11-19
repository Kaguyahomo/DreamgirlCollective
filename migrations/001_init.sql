-- Words table (active weekly words)
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT UNIQUE NOT NULL,
  definition TEXT NOT NULL
);

-- Backup words pool (permanent word list)
CREATE TABLE IF NOT EXISTS backup_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT UNIQUE NOT NULL,
  definition TEXT NOT NULL
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  score INTEGER DEFAULT 0
);
