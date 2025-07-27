const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../utils/error/InvariantError');
const NotFoundError = require('../utils/error/NotFoundError');
const { uploadAlbumCover } = require('../utils/storage');
const redis = require('../utils/redisClient');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, new Date(), id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async getAlbumByIdWithSongs(id) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const albumResult = await this._pool.query(albumQuery);
    const songsResult = await this._pool.query(songsQuery);

    if (!albumResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return {
      ...albumResult.rows[0],
      songs: songsResult.rows,
    };
  }

  async uploadAlbumCover(id, cover) {
    const coverUrl = await uploadAlbumCover(id, cover);
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(
        'Gagal memperbarui sampul album. Id tidak ditemukan'
      );
    }
    return result.rows[0];
  }

  async getAlbumLikes(id) {
    const cacheKey = `album_likes:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      return {
        likes: parseInt(cached, 10),
        fromCache: true,
      };
    }

    const query = {
      text: 'SELECT COUNT(*) FROM album_likes WHERE album_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    const likeCount = parseInt(result.rows[0].count, 10);
    await redis.set(cacheKey, likeCount, 'EX', 1800);
    return {
      likes: likeCount,
      fromCache: false,
    };
  }

  async addAlbumLike(albumId, userId) {
    const id = `like-${nanoid(16)}`;
    const albumCheck = await this._pool.query({
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    });
    if (!albumCheck.rowCount) throw new NotFoundError('Album tidak ditemukan');

    const likeCheck = await this._pool.query({
      text: 'SELECT id FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    });
    if (likeCheck.rowCount)
      throw new InvariantError('Anda sudah menyukai album ini');

    await this._pool.query({
      text: 'INSERT INTO album_likes (id, album_id, user_id) VALUES ($1, $2 , $3)',
      values: [id, albumId, userId],
    });

    await this._pool.query({
      text: 'UPDATE albums SET link_count = link_count + 1 WHERE id = $1',
      values: [albumId],
    });

    await redis.del(`album_likes:${albumId}`);
  }

  async deleteAlbumLike(albumId, userId) {
    const result = await this._pool.query({
      text: 'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    });
    if (!result.rowCount) throw new NotFoundError('Like tidak ditemukan');

    await this._pool.query({
      text: 'UPDATE albums SET link_count = GREATEST(link_count - 1, 0) WHERE id = $1',
      values: [albumId],
    });

    await redis.del(`album_likes:${albumId}`);
  }
}

module.exports = AlbumsService;
