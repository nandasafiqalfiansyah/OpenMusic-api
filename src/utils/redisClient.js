const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_SERVER,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

module.exports = redis;
