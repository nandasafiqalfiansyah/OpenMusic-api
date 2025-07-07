const { UserPayloadSchema } = require('../utils/validator');
const InvariantError = require('../utils/error/InvariantError');

const UsersHandler = require('../handlers/users'); // ✅ Import class
const UsersService = require('../services/UsersService'); // pastikan ini ada

const usersService = new UsersService(); // ✅ Buat instance service
const usersHandler = new UsersHandler(usersService); // ✅ Buat instance handler

const failAction = (request, h, err) => {
  throw new InvariantError(err.message);
};

const routes = [
  {
    method: 'POST',
    path: '/users',
    handler: usersHandler.postUserHandler, // ✅ Ambil dari instance
    options: {
      validate: {
        payload: UserPayloadSchema,
        failAction,
      },
    },
  },
];

module.exports = routes;
