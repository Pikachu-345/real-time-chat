const redis = require('redis');
require('dotenv').config(); 

let redisClient; 

async function connectRedis() {
  try {
    if (redisClient && redisClient.isReady) {
      console.log("Redis client already connected.");
      return redisClient;
    }
    redisClient = redis.createClient({
      url: process.env.REDIS_URI || 'redis://127.0.0.1:6379'
    });
    redisClient.on('error', err => console.error('Redis Client Error', err));

    await redisClient.connect();
    console.log("Redis Connected");
    return redisClient; 
  } catch (e) {
    console.error("Failed to connect to Redis:", e);
    process.exit(1);
  }
}

module.exports = connectRedis;