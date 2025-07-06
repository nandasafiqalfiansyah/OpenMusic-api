const { AlbumPayloadSchema } = require('../utils/validator');
const InvariantError = require('../utils/error/InvariantError');

const {
  postAlbumHandler,
  putAlbumByIdHandler,
  deleteAlbumByIdHandler,
  getAlbumByIdWithSongsHandler,
} = require('../handlers/albums');

const failAction = (request, h, err) => {
  throw new InvariantError(err.message);
};

const routes = [
  {
    method: 'POST',
    path: '/albums',
    handler: postAlbumHandler,
    options: {
      validate: {
        payload: AlbumPayloadSchema,
        failAction,
      },
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: getAlbumByIdWithSongsHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: putAlbumByIdHandler,
    options: {
      validate: {
        payload: AlbumPayloadSchema,
        failAction,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: deleteAlbumByIdHandler,
  },
];

module.exports = routes;
