const config = require('../config/config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.db.database, config.db.user, config.db.pass, {
  host: config.db.host,
  dialect: config.db.dialect,
  pool: config.db.pool,
  storage: config.db.storage,
  logging: config.db.logging
});

const init = async (force) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: force || false })
    return 'Sequelize database connection has been established successfully.';
  } catch (error) {
    throw new Error('Sequelize database connection failed!');
  }
}

module.exports = {
  init,
  sequelize,
  Sequelize
};
