const bunyan = require('bunyan');
const tenant = process.env.TENANT || '';

module.exports = {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 9000,
    logger: bunyan.createLogger({
        name: 'expressApplication',                     // Required
        level: process.env.LEVEL || 'debug',      // Optional, see "Levels" section
    }),
    session: {
        secret: process.env.SECRET || 'session secret',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
    },
    db: {
        database: process.env.DB || 'authentication_database',
        user: process.env.DB_USER || 'username',
        pass: process.env.DB_PASS || 'pasword',
        host: process.env.DB_HOST || 'localhost',
        storage: process.env.DB_STORAGE || 'data/database.sqlite',
        logging: false,
        dialect: process.env.DB_DIALECT || 'sqlite',
        eraseDatabaseOnSync: false,
        pool: {
            max: process.env.DB_POOL_MAX || 5,
            min: process.env.DB_POOL_MIN || 0,
            acquire: process.env.DB_POOL_ACQUIRE || 30000,
            idle: process.env.DB_POOL_IDLE || 10000,
        }
    },
    azure: {
        identityMetadata: `https://login.microsoftonline.com/${tenant}/.well-known/openid-configuration`, 
        clientID: process.env.CLIENT_ID || '',
        issuer: [`https://sts.windows.net/${tenant}/`, `https://login.microsoftonline.com/${tenant}/v2.0`],
        validateIssuer: true,
        loggingLevel: process.env.LEVEL || 'debug',
    }
};