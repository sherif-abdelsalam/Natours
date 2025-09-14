require('dotenv').config();
const { connectRedis } = require('./utils/redisClient');
const mongoose = require('mongoose');
const app = require('./app');
const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => {
  console.log('✅ DB connection successful!');
});
connectRedis();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`✅ Redis connected App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, '== ' + err.message);
  console.log('Shutting down the server.......');

  server.close(() => {
    process.exit();
  });
});

process.on('uncaughtException', err => {
  console.log(err.name, '== ' + err.message);
});
