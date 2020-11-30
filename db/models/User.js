const db = require('../sequelize');

const User = db.sequelize.define('user', {
    firstName: {
        type: db.Sequelize.STRING
    },
    lastName: {
        type: db.Sequelize.STRING
    },
    emailAddress: {
        type: db.Sequelize.STRING
    },
    aadId: {
        type: db.Sequelize.STRING
    }
});

module.exports = User;