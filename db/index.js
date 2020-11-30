const models = require('./models');
const db = require('./sequelize');

module.exports = {
  ...db,
  ...models
};
