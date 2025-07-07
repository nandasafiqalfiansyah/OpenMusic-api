require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const albums = require('./routes/albums');
const songs = require('./routes/songs');
const users = require('./routes/users');
const authenticationsRoutes = require('./routes/authentications');
const playlistsRoutes = require('./routes/playlists');
const ClientError = require('./utils/error/ClientError');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Register routes
  server.route([
    ...albums,
    ...songs,
    ...users,
    ...authenticationsRoutes,
    ...playlistsRoutes,
  ]);
  // 🛠 Tangani custom error
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      return h
        .response({
          status: 'fail',
          message: response.message,
        })
        .code(response.statusCode);
    }

    if (response instanceof Error) {
      return h
        .response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        })
        .code(500);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
