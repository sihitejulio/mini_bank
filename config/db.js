const { Sequelize } = require('sequelize');

const mini_bank = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: 'mini_bank',
  logging: false,
});

module.exports = {mini_bank}
