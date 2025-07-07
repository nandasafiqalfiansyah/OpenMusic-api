const ClientError = require('../utils/error/ClientError');

class PlaylistsHandler {
  constructor(playlistsService, validator) {
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsFromPlaylistHandler =
      this.getSongsFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler =
      this.deleteSongFromPlaylistHandler.bind(this);
    this.getPlaylistActivitiesHandler =
      this.getPlaylistActivitiesHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._playlistsService.addPlaylist({
        name,
        owner: credentialId,
      });

      return h
        .response({
          status: 'success',
          data: {
            playlistId,
          },
        })
        .code(201);
    } catch (error) {
      console.log(error);
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(error.statusCode);
      }

      // Server error
      return h
        .response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        })
        .code(500);
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._playlistsService.getPlaylists(credentialId);

      return h.response({
        status: 'success',
        data: {
          playlists,
        },
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(error.statusCode);
      }

      // Server error
      return h
        .response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        })
        .code(500);
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(id, credentialId);
      await this._playlistsService.deletePlaylistById(id);

      return h.response({
        status: 'success',
        message: 'Playlist berhasil dihapus',
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(error.statusCode);
      }

      // Server error
      return h
        .response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        })
        .code(500);
    }
  }

  async postSongToPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(id, credentialId);
      await this._playlistsService.addSongToPlaylist(id, songId);
      await this._playlistsService.addActivity(id, songId, credentialId, 'add');

      return h
        .response({
          status: 'success',
          message: 'Lagu berhasil ditambahkan ke playlist',
        })
        .code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(error.statusCode);
      }

      // Server error
      return h
        .response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        })
        .code(500);
    }
  }

  async getSongsFromPlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(id, credentialId);
      const playlist = await this._playlistsService.getSongsFromPlaylist(id);

      return h.response({
        status: 'success',
        data: {
          playlist,
        },
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(error.statusCode);
      }

      // Server error
      return h
        .response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        })
        .code(500);
    }
  }

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(id, credentialId);
      await this._playlistsService.deleteSongFromPlaylist(id, songId);
      await this._playlistsService.addActivity(
        id,
        songId,
        credentialId,
        'delete'
      );

      return h.response({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(error.statusCode);
      }

      // Server error
      return h
        .response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        })
        .code(500);
    }
  }

  async getPlaylistActivitiesHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(id, credentialId);
      const activities = await this._playlistsService.getActivities(id);

      return h.response({
        status: 'success',
        data: {
          playlistId: id,
          activities,
        },
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(error.statusCode);
      }

      // Server error
      return h
        .response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        })
        .code(500);
    }
  }
}

module.exports = PlaylistsHandler;
