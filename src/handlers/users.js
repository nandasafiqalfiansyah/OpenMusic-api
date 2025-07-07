const ClientError = require('../utils/error/ClientError');

class UsersHandler {
  constructor(usersService) {
    this._usersService = usersService;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    try {
      const { username, password, fullname } = request.payload;

      const userId = await this._usersService.addUser({
        username,
        password,
        fullname,
      });

      return h
        .response({
          status: 'success',
          data: {
            userId,
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
  }
}

module.exports = UsersHandler;
