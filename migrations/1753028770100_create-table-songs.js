/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const up = (pgm) => {
  pgm.createTable('songs', {
    id: { type: 'varchar(255)', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    year: { type: 'integer', notNull: true },
    genre: { type: 'varchar(255)', notNull: true },
    performer: { type: 'varchar(255)', notNull: true },
    duration: { type: 'integer' },
    album_id: {
      type: 'varchar(255)',
      references: 'albums',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const down = (pgm) => {
  pgm.dropTable('songs');
};

module.exports = { shorthands, up, down };
