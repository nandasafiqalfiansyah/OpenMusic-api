const AuthenticationsHandler = require('../handlers/authentications');
const AuthenticationsService = require('../services/AuthenticationsService');
const UsersService = require('../services/UsersService');
const TokenManager = require('../utils/token/TokenManager');

const {
  AuthPayloadSchema,
  RefreshTokenPayloadSchema,
} = require('../utils/validator');
const InvariantError = require('../utils/error/InvariantError');

// Inisialisasi service & handler
const authenticationsService = new AuthenticationsService();
const usersService = new UsersService();
const tokenManager = new TokenManager();

const authenticationsHandler = new AuthenticationsHandler(
  authenticationsService,
  usersService,
  tokenManager
);

const failAction = (request, h, err) => {
  throw new InvariantError(err.message);
};

const routes = [
  {
    method: 'POST',
    path: '/authentications',
    handler: authenticationsHandler.postAuthenticationHandler, // ✅ dari instance
    options: {
      validate: {
        payload: AuthPayloadSchema,
        failAction,
      },
    },
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: authenticationsHandler.putAuthenticationHandler, // ✅ dari instance
    options: {
      validate: {
        payload: RefreshTokenPayloadSchema,
        failAction,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: authenticationsHandler.deleteAuthenticationHandler, // ✅ dari instance
    options: {
      validate: {
        payload: RefreshTokenPayloadSchema,
        failAction,
      },
    },
  },
];

module.exports = routes;
