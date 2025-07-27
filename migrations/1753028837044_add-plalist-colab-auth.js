/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const up = (pgm) => {
  // Tabel users
  pgm.createTable('users', {
    id: { type: 'varchar(255)', primaryKey: true },
    username: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    fullname: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Tabel playlists
  pgm.createTable('playlists', {
    id: { type: 'varchar(255)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    owner: {
      type: 'varchar(255)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Tabel playlist_songs
  pgm.createTable('playlist_songs', {
    id: { type: 'varchar(255)', primaryKey: true },
    playlist_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"playlists"',
      onDelete: 'CASCADE',
    },
    song_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"songs"',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('playlist_songs', 'unique_playlist_song', {
    unique: ['playlist_id', 'song_id'],
  });

  // Tabel playlist_song_activities
  pgm.createTable('playlist_song_activities', {
    id: { type: 'varchar(255)', primaryKey: true },
    playlist_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"playlists"',
      onDelete: 'CASCADE',
    },
    song_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"songs"',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    action: {
      type: 'varchar(50)',
      notNull: true,
      check: `action IN ('add', 'delete')`,
    },
    time: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Tabel collaborations
  pgm.createTable('collaborations', {
    id: { type: 'varchar(255)', primaryKey: true },
    playlist_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"playlists"',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('collaborations', 'unique_collaboration', {
    unique: ['playlist_id', 'user_id'],
  });

  // Tabel authentications
  pgm.createTable('authentications', {
    token: { type: 'varchar(255)', primaryKey: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const down = (pgm) => {
  pgm.dropTable('authentications');
  pgm.dropTable('collaborations');
  pgm.dropTable('playlist_song_activities');
  pgm.dropTable('playlist_songs');
  pgm.dropTable('playlists');
  pgm.dropTable('users');
};

module.exports = { shorthands, up, down };
