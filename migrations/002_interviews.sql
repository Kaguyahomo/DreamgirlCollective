-- Interviews table for storing video interview metadata
CREATE TABLE IF NOT EXISTS interviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for sorting by date
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(date DESC);
