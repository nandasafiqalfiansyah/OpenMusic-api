/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('album_likes', {
    id: { type: 'varchar(255)', primaryKey: true },
    album_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"albums"',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
  });

  // Membuat kombinasi album_id + user_id harus unik
  pgm.addConstraint('album_likes', 'unique_album_user_like', {
    unique: ['album_id', 'user_id'],
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('album_likes');
};
