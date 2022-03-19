const Redis = require('ioredis');

const redis = new Redis(parseInt(process.env.REDIS_PORT, 10), process.env.REDIS_HOST);

module.exports = redis;