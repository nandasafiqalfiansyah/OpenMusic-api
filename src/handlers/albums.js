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
    console.error(error);
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

module.exports = {
  postAlbumHandler,
  getAlbumByIdHandler,
  putAlbumByIdHandler,
  deleteAlbumByIdHandler,
  getAlbumByIdWithSongsHandler,
};
