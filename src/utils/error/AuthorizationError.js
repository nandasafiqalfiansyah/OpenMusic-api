const ClientError = require('./ClientError');
class AuthorizationError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

module.exports = AuthorizationError;
