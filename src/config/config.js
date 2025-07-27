require('dotenv').config();

module.exports = {
  app: {
    baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
  auth: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
  },
};
