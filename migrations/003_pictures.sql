-- Pictures table for storing digital picture metadata
CREATE TABLE IF NOT EXISTS pictures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for sorting by date
CREATE INDEX IF NOT EXISTS idx_pictures_date ON pictures(date DESC);
