const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Redis Client Connected');
});

client.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
  // Don't exit process in production - app can work without Redis for some features
  if (process.env.NODE_ENV === 'development') {
    console.warn('Warning: Redis connection failed. Some features may not work.');
  }
});

module.exports = client;
