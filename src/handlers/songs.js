const SongsService = require('../services/SongsService');
const ClientError = require('../utils/error/ClientError');

const songsService = new SongsService();

const postSongHandler = async (request, h) => {
  try {
    const { title, year, genre, performer, duration, albumId } =
      request.payload;

    const songId = await songsService.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    return h
      .response({
        status: 'success',
        data: {
          songId,
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

const getSongsHandler = async (request, h) => {
  try {
    const { title, performer } = request.query;
    const songs = await songsService.getSongs({ title, performer });

    return {
      status: 'success',
      data: {
        songs,
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

const getSongByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const song = await songsService.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
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

const putSongByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const { title, year, genre, performer, duration, albumId } =
      request.payload;

    await songsService.editSongById(id, {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
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

const deleteSongByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;
    await songsService.deleteSongById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
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
  postSongHandler,
  getSongsHandler,
  getSongByIdHandler,
  putSongByIdHandler,
  deleteSongByIdHandler,
};
