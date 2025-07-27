const ClientError = require('../utils/error/ClientError');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler =
      this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      const { playlistId, userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      await this._usersService.verifyUserExist(userId);
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      const collaborationId =
        await this._collaborationsService.addCollaboration(playlistId, userId);

      return h
        .response({
          status: 'success',
          data: {
            collaborationId,
          },
        })
        .code(201);
    } catch (error) {
      console.log('Eror saat C' + error);
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

  async deleteCollaborationHandler(request, h) {
    try {
      const { playlistId, userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      await this._usersService.verifyUserExist(userId);
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return h.response({
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      });
    } catch (error) {
      console.log('Eror saat DELETE' + error);
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

module.exports = CollaborationsHandler;
