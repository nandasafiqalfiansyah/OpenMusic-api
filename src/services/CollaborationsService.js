const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../utils/error/InvariantError');
const NotFoundError = require('../utils/error/NotFoundError');
const AuthorizationError = require('../utils/error/AuthorizationError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    // Cek apakah kolaborasi sudah ada
    const checkQuery = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const checkResult = await this._pool.query(checkQuery);
    if (checkResult.rows.length > 0) {
      throw new InvariantError('Kolaborasi sudah ada');
    }

    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Kolaborasi tidak ditemukan');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('Anda bukan kolaborator playlist ini');
    }
  }
}

module.exports = CollaborationsService;
