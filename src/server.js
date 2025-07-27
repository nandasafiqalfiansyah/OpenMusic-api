require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const fs = require('fs').promises;

// Routes
const albums = require('./routes/albums');
const songs = require('./routes/songs');
const users = require('./routes/users');
const colaboration = require('./routes/collaborations');
const authenticationsRoutes = require('./routes/authentications');
const playlistsRoutes = require('./routes/playlists');

// Error handler
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

  // Inisialisasi folder penting
  const initFolders = async () => {
    const folders = [
      path.resolve(__dirname, 'uploads', 'covers'),
      path.resolve(__dirname, 'public'),
    ];

    for (const dir of folders) {
      try {
        await fs.access(dir);
      } catch (error) {
        await fs.mkdir(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }

    // Buat file default cover jika belum ada
    const defaultCoverPath = path.resolve(
      __dirname,
      'public',
      'default-cover.jpg'
    );
    if (!(await fileExists(defaultCoverPath))) {
      const defaultCover = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64'
      );
      await fs.writeFile(defaultCoverPath, defaultCover);
    }
  };

  await initFolders();

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert, // Plugin untuk static files
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
    ...colaboration,
  ]);

  // Endpoint untuk cover album
  server.route({
    method: 'GET',
    path: '/covers/{filename}',
    handler: async (request, h) => {
      const filename = request.params.filename;
      const safeFilename = filename.replace(/[^a-z0-9._-]/gi, '');

      const filePath = path.resolve(
        __dirname,
        'uploads',
        'covers',
        safeFilename
      );
      const defaultPath = path.resolve(
        __dirname,
        'public',
        'default-cover.jpg'
      );

      try {
        await fs.access(filePath);
        return h
          .file(filePath)
          .header('Cache-Control', 'public, max-age=31536000');
      } catch (error) {
        return h.file(defaultPath).header('Cache-Control', 'no-store');
      }
    },
    options: {
      auth: false,
      cors: {
        additionalHeaders: ['cache-control', 'x-requested-with'],
      },
    },
  });

  // Custom error handler
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

    if (response.isBoom) {
      const statusCode = response.output.statusCode;

      if (statusCode === 400) {
        return h
          .response({
            status: 'fail',
            message: response.message,
          })
          .code(400);
      }

      if (statusCode === 401) {
        return h
          .response({
            status: 'fail',
            message: 'Unauthorized',
          })
          .code(401);
      }

      if (statusCode === 403) {
        return h
          .response({
            status: 'fail',
            message: 'Forbidden',
          })
          .code(403);
      }

      if (statusCode === 404) {
        return h
          .response({
            status: 'fail',
            message: 'Resource tidak ditemukan',
          })
          .code(404);
      }

      if (statusCode === 413) {
        return h
          .response({
            status: 'fail',
            message: 'Payload terlalu besar',
          })
          .code(413);
      }
    }

    if (response instanceof Error) {
      console.error('Server Error:', response);
      return h
        .response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami',
        })
        .code(500);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

// Helper untuk cek file exists
async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

init();
