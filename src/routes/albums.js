const {
  AlbumPayloadSchema,
  AlbumCoverPayloadSchema,
} = require('../utils/validator');
const InvariantError = require('../utils/error/InvariantError');

const {
  postAlbumHandler,
  putAlbumByIdHandler,
  deleteAlbumByIdHandler,
  getAlbumByIdWithSongsHandler,
  uploadAlbumCoverHandler,
  getAlbumLikesHandler,
  addAlbumLikeHandler,
  deleteAlbumLikeHandler,
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

  // Mengunggah Sampul Album post
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: uploadAlbumCoverHandler,
    options: {
      payload: {
        parse: true,
        output: 'stream',
        multipart: true,
        allow: 'multipart/form-data',
      },
      validate: {
        payload: AlbumCoverPayloadSchema,
        failAction,
      },
    },
  },

  // crud like albums
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: getAlbumLikesHandler,
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: addAlbumLikeHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: deleteAlbumLikeHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
