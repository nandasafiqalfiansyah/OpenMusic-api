const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../utils/error/InvariantError');
const NotFoundError = require('../utils/error/NotFoundError');
const AuthorizationError = require('../utils/error/AuthorizationError');
const { getChannel } = require('../utils/rabbitmq');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `
        SELECT DISTINCT playlists.id, playlists.name, users.username 
        FROM playlists
        LEFT JOIN users ON users.id = playlists.owner
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1
      `,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId
        );
      } catch {
        throw error;
      }
    }
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Music tidak ditemukan');
    }
    return result.rows[0];
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;

    const song = await this.getSongById(songId);
    if (!song) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    const playlistQuery = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const playlistQuery = {
      text: `
        SELECT playlists.id, playlists.name, users.username 
        FROM playlists 
        JOIN users ON users.id = playlists.owner 
        WHERE playlists.id = $1
      `,
      values: [playlistId],
    };

    const songsQuery = {
      text: `
        SELECT songs.id, songs.title, songs.performer 
        FROM songs 
        JOIN playlist_songs ON playlist_songs.song_id = songs.id 
        WHERE playlist_songs.playlist_id = $1
      `,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    const songsResult = await this._pool.query(songsQuery);

    if (!playlistResult.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return {
      ...playlistResult.rows[0],
      songs: songsResult.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Lagu gagal dihapus dari playlist. Id tidak ditemukan'
      );
    }

    await this.addActivity(playlistId, songId, userId, 'delete');
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: `
        INSERT INTO playlist_song_activities 
        VALUES($1, $2, $3, $4, $5, $6) RETURNING id
      `,
      values: [id, playlistId, songId, userId, action, time],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }
  }

  async getActivities(playlistId) {
    const query = {
      text: `
        SELECT users.username, songs.title, activities.action, activities.time 
        FROM playlist_song_activities activities
        JOIN users ON users.id = activities.user_id
        JOIN songs ON songs.id = activities.song_id
        WHERE activities.playlist_id = $1
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return result.rows;
  }

  async sendExportPlaylistRequest({ playlistId, targetEmail }) {
  const channel = await getChannel();

  const message = {
    playlistId,
    targetEmail,
  };

  await channel.assertQueue('export:playlist', {
    durable: true,
  });

  channel.sendToQueue(
    'export:playlist',
    Buffer.from(JSON.stringify(message))
  );
}
}

module.exports = PlaylistsService;
