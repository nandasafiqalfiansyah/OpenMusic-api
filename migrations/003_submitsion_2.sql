-- Tabel users
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel playlists
CREATE TABLE playlists (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel playlist_songs (junction table)
CREATE TABLE playlist_songs (
  id VARCHAR(255) PRIMARY KEY,
  playlist_id VARCHAR(255) NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id VARCHAR(255) NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (playlist_id, song_id) -- Mencegah duplikasi lagu dalam playlist
);

-- Tabel playlist_song_activities (log aktivitas)
CREATE TABLE playlist_song_activities (
  id VARCHAR(255) PRIMARY KEY,
  playlist_id VARCHAR(255) NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id VARCHAR(255) NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('add', 'remove')), -- Hanya izinkan nilai tertentu
  time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel collaborations
CREATE TABLE collaborations (
  id VARCHAR(255) PRIMARY KEY,
  playlist_id VARCHAR(255) NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (playlist_id, user_id) -- Mencegah duplikasi kolaborasi
);