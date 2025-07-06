const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../utils/error/InvariantError');
const NotFoundError = require('../utils/error/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query(
      'SELECT id, title, performer FROM songs'
    );
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        new Date(),
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }

  // eslint-disable-next-line no-dupe-class-members
  async getSongs({ title, performer }) {
    let queryText = 'SELECT id, title, performer FROM songs';
    const values = [];

    if (title || performer) {
      const conditions = [];

      if (title) {
        conditions.push(`title ILIKE $${values.length + 1}`);
        values.push(`%${title}%`);
      }

      if (performer) {
        conditions.push(`performer ILIKE $${values.length + 1}`);
        values.push(`%${performer}%`);
      }

      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this._pool.query({
      text: queryText,
      values,
    });

    return result.rows;
  }
}
module.exports = SongsService;
