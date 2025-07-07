const jwt = require('jsonwebtoken');
const InvariantError = require('../../utils/error/InvariantError');

class TokenManager {
  constructor() {
    this._accessTokenKey = process.env.ACCESS_TOKEN_KEY;
    this._refreshTokenKey = process.env.REFRESH_TOKEN_KEY;
  }

  generateAccessToken(payload) {
    return jwt.sign(payload, this._accessTokenKey, { expiresIn: '15m' });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, this._refreshTokenKey, { expiresIn: '7d' });
  }

  verifyRefreshToken(token) {
    try {
      const artifacts = jwt.verify(token, this._refreshTokenKey);
      return artifacts;
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }
}

module.exports = TokenManager;
