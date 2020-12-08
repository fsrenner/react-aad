const { User } = require('../db');
const config = require('../config/config');
const Logger = config.logger;

module.exports = {
    getUsers: async (req, res) => {
        const action = 'getUsers';
        Logger.info(`${new Date().toUTCString()} | ${action} | ${req.ip} | Session User ${req.session.userId}`);
        const users = await User.findAll();
        return res.json(users);
    },
    getUser: async (req, res) => {
        const id = req.params.id;
        const action = 'getUser';
        Logger.info(`${new Date().toUTCString()} | ${action} | ${req.ip} | Session User ${req.session.userId}`);
        const user = await User.findOne({ where: { id } });
        return res.json(user);
    },
    getUserIds: async (req, res) => {
        const action = 'getUserIds';
        Logger.info(`${new Date().toUTCString()} | ${action} | ${req.ip} | Session User ${req.session.userId}`);
        const users = await User.findAll({
            where: {},
            attributes: ['id'],
            raw: true
        });
        return res.json((users) ? users.map(user => user.id) : []);
    },
    addUser: async (req, res) => {
        const action = 'addUser';
        Logger.info(`${new Date().toUTCString()} | ${action} | ${req.ip} | Session User ${req.session.userId}`);
        const firstName = (req.body.firstName) ? req.body.firstName : null;
        const lastName = (req.body.lastName) ? req.body.lastName : null;
        const emailAddress = (req.body.emailAddress) ? req.body.emailAddress : null;
        const aadId = (req.body.aadId) ? req.body.aadId : null;
        const error = [];
        if (!firstName) error.push('firstName');
        if (!lastName) error.push('lastName');
        if (!emailAddress) error.push('emailAddress');

        if (error.length > 0) {
            return res.status(400).json({
                message: `The following required parameters were missing: ${error.join(', ')}`
            });
        }
        const user = await User.create({ firstName, lastName, emailAddress, aadId});
        return res.json(user);
    },
    updateUser: async (req, res) => {
        const id = req.params.id;
        const action = 'updateUser';
        Logger.info(`${new Date().toUTCString()} | ${action} | ${req.ip} | Session User ${req.session.userId}`);
        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({
                message: `User: ${id} was not found. Cannot update user.`
            });
        }

        const updateObject = {};
        if (req.body.firstName) {
            updateObject.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
            updateObject.lastName = req.body.lastName;
        }

        if (req.body.emailAddress) {
            updateObject.emailAddress = req.body.emailAddress;
        }

        if (req.body.aadId) {
            updateObject.aadId = req.body.aadId;
        }

        await User.update(updateObject, { 
            where: { id }
        });
        const fullUpdatedUserRecord = await User.findOne({ where: { id } });
        return res.json(fullUpdatedUserRecord);
    },
    deleteUser: async (req, res) => {
        const id = req.params.id;
        const action = 'deleteUser';
        Logger.info(`${new Date().toUTCString()} | ${action} | ${req.ip} | Session User ${req.session.userId}`);
        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({
                message: `User: ${id} was not found. Cannot delete user.`
            });
        }

        await User.destroy({
            where: { id }
        });

        return res.json(user);
    }
}