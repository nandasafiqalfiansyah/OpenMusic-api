const { CollaborationPayloadSchema } = require('../utils/validator');
const InvariantError = require('../utils/error/InvariantError');
const CollaborationsHandler = require('../handlers/CollaborationsHandler');
const CollaborationsService = require('../services/CollaborationsService');
const PlaylistsService = require('../services/PlaylistsService');
const UsersService = require('../services/UsersService');

// Inisialisasi services
const collaborationsService = new CollaborationsService();
const playlistsService = new PlaylistsService(collaborationsService);
const usersService = new UsersService();

// Inisialisasi handler
const collaborationsHandler = new CollaborationsHandler(
  collaborationsService,
  playlistsService,
  usersService
);

const failAction = (request, h, err) => {
  throw new InvariantError(err.message);
};

module.exports = [
  {
    method: 'POST',
    path: '/collaborations',
    handler: collaborationsHandler.postCollaborationHandler,
    options: {
      auth: 'openmusic_jwt',
      validate: {
        payload: CollaborationPayloadSchema,
        failAction,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: collaborationsHandler.deleteCollaborationHandler,
    options: {
      auth: 'openmusic_jwt',
      validate: {
        payload: CollaborationPayloadSchema,
        failAction,
      },
    },
  },
];
