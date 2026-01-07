-- Users table (populated from Cloudflare Access JWT)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Taps table for recording resist/yield events
CREATE TABLE IF NOT EXISTS taps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('resist', 'yield')),
  category TEXT,
  timestamp INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Index for efficient queries by user and time range
CREATE INDEX IF NOT EXISTS idx_taps_user_timestamp ON taps(user_id, timestamp);
