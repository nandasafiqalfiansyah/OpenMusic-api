const AlbumsService = require('../services/AlbumsService');
const ClientError = require('../utils/error/ClientError');

const albumsService = new AlbumsService();

const postAlbumHandler = async (request, h) => {
  try {
    const { name, year } = request.payload;
    const albumId = await albumsService.addAlbum({ name, year });

    return h
      .response({
        status: 'success',
        data: {
          albumId,
        },
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
};

const getAlbumByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const album = await albumsService.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
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
};

const putAlbumByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const { name, year } = request.payload;

    await albumsService.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
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
};

const deleteAlbumByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;
    await albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
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
};

const uploadAlbumCoverHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const { cover } = request.payload;

    if (!cover) {
      throw new ClientError('Sampul album tidak ditemukan', 400);
    }
    const MAX_SIZE = 512 * 1024;
    let fileSize = 0;

    await new Promise((resolve, reject) => {
      cover.on('data', (chunk) => {
        fileSize += chunk.length;
        if (fileSize > MAX_SIZE) {
          cover.destroy();
          reject(new ClientError('Ukuran file maksimal 512KB', 413));
        }
      });

      cover.on('end', () => resolve());
      cover.on('error', () =>
        reject(new Error('Terjadi kesalahan saat membaca file'))
      );
    });
    //  validasi maksimal 512000 Bytes.

    if (cover.hapi && cover.hapi.size > 512000) {
      return h
        .response({
          status: 'fail',
          message: 'Ukuran sampul album melebihi batas maksimal 512KB',
        })
        .code(413);
    }

    // Validasi apakah cover adalah file gambar
    if (
      !['image/png', 'image/jpeg'].includes(cover.hapi.headers['content-type'])
    ) {
      throw new ClientError(
        'Sampul album harus berupa file gambar (PNG/JPEG)',
        400
      );
    }

    await albumsService.uploadAlbumCover(id, cover);

    return h
      .response({
        status: 'success',
        message: 'Sampul album berhasil diunggah',
      })
      .code(201);
  } catch (error) {
    // Tangani error yang berasal dari custom ClientError
    if (error instanceof ClientError) {
      return h
        .response({
          status: 'fail',
          message: error.message,
        })
        .code(error.statusCode);
    }
    return h
      .response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.' + error.message,
      })
      .code(500);
  }
};

// For optional feature: Get album with songs
const getAlbumByIdWithSongsHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const album = await albumsService.getAlbumByIdWithSongs(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
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
};
// like handler for likes
const getAlbumLikesHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const like = await albumsService.getAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: like,
    });

    if (like.fromCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
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
};
const addAlbumLikeHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await albumsService.addAlbumLike(id, credentialId);

    return h
      .response({
        status: 'success',
        message: 'Like added successfully',
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
};
const deleteAlbumLikeHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await albumsService.deleteAlbumLike(id, credentialId);
    return {
      status: 'success',
      message: 'Like removed successfully',
    };
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
};

module.exports = {
  postAlbumHandler,
  getAlbumByIdHandler,
  putAlbumByIdHandler,
  deleteAlbumByIdHandler,
  getAlbumByIdWithSongsHandler,
  uploadAlbumCoverHandler,
  getAlbumLikesHandler,
  addAlbumLikeHandler,
  deleteAlbumLikeHandler,
};
