/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: { type: 'varchar(255)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    year: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('albums');
};
