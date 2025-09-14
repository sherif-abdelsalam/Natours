// utils/redisClient.js
const { createClient } = require('redis');

const client = createClient();

client.on('error', err => console.error('Redis Client Error', err));

function connectRedis() {
  if (!client.isOpen) {
    client
      .connect()
      .then(() => {
        console.log('✅ Redis connected');
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = { client, connectRedis };
