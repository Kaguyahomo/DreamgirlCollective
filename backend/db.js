const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// ----- WORD LIST -----
db.run(\
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT UNIQUE,
  definition TEXT
);
\);

// Backup table to restore weekly
db.run(\
CREATE TABLE IF NOT EXISTS words_backup (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT UNIQUE,
  definition TEXT
);
\);

// ----- LEADERBOARD -----
db.run(\
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\);

module.exports = db;
