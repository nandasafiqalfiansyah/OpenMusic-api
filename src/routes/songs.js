const { SongPayloadSchema } = require('../utils/validator');
const InvariantError = require('../utils/error/InvariantError');

const {
  postSongHandler,
  getSongsHandler,
  getSongByIdHandler,
  putSongByIdHandler,
  deleteSongByIdHandler,
} = require('../handlers/songs');

const failAction = (request, h, err) => {
  throw new InvariantError(err.message);
};

const routes = [
  {
    method: 'POST',
    path: '/songs',
    handler: postSongHandler,
    options: {
      validate: {
        payload: SongPayloadSchema,
        failAction,
      },
    },
  },
  {
    method: 'GET',
    path: '/songs',
    handler: getSongsHandler,
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: getSongByIdHandler,
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: putSongByIdHandler,
    options: {
      validate: {
        payload: SongPayloadSchema,
        failAction,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: deleteSongByIdHandler,
  },
];

module.exports = routes;
