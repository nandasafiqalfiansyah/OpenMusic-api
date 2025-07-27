const {
  PlaylistPayloadSchema,
  PlaylistSongPayloadSchema,
} = require('../utils/validator');
const InvariantError = require('../utils/error/InvariantError');

// Import class dan dependency service
const PlaylistsHandler = require('../handlers/playlists');
const PlaylistsService = require('../services/PlaylistsService');
const SongsService = require('../services/SongsService');

// Inisialisasi instance handler
const playlistsHandler = new PlaylistsHandler(
  new PlaylistsService(),
  new SongsService()
);

const failAction = (request, h, err) => {
  throw new InvariantError(err.message);
};

const routes = [
  {
    method: 'POST',
    path: '/playlists',
    handler: playlistsHandler.postPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
      validate: {
        payload: PlaylistPayloadSchema,
        failAction,
      },
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: playlistsHandler.getPlaylistsHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: playlistsHandler.deletePlaylistByIdHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: playlistsHandler.postSongToPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
      validate: {
        payload: PlaylistSongPayloadSchema,
        failAction,
      },
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: playlistsHandler.getSongsFromPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: playlistsHandler.deleteSongFromPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
      validate: {
        payload: PlaylistSongPayloadSchema,
        failAction,
      },
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: playlistsHandler.getPlaylistActivitiesHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },

  //Ekspor Lagu Pada Playlist
  {
    method: 'POST',
    path: '/export/playlists/{id}',
    handler: playlistsHandler.exportSongsFromPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
