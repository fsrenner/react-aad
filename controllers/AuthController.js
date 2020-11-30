const { User } = require('../db');
const passport = require('passport');
const util = require('../util');
const config = require('../config/config');
const Logger = config.logger;

module.exports = {
    login: async (req, res) => {
      const decodedToken = req.authInfo;
      const action = 'AuthController.login';
      const now = Date.now();
      const expiration = (decodedToken.exp) ? decodedToken.exp * 1000 : 0;
      const remainingTime = util.getRemainingTime(now, expiration);
      let message = '';
      if (!decodedToken) {
        message = `The authentication token from Azure Active Directory is invalid or missing. It evaluated to ${JSON.stringify(decodedToken)}`;
        Logger.error(message);
        return res.status(401).json({ message });
      } else if (!decodedToken.oid) {
        message = 'The user Azure Active Directory Id was not found in the token';
        Logger.error(message);
        return res.status(401).json({ message });
      }

      const user = await User.findOne({
          where: {
              emailAddress: decodedToken.preferred_username,
              aadId: decodedToken.oid
          } 
      });

      if (!user) {
        message = `The Azure User: ${decodedToken.given_name} ${decodedToken.family_name} with AAD id: ${decodedToken.oid} was not found. They may need to be added`;
        Logger.warn(message);
        return res.status(401).json({ message });
      }

      req.session.userId = user.id;
      Logger.info(`${new Date().toUTCString()} | ${action} | ${req.ip} | User ${user.id}, ${user.emailAddress} with AAD id ${decodedToken.oid} has logged into TOMIS with an authentication token that will expire in ${remainingTime}`);
      return res.json(user);
      },
    unauthorized: async (req, res) => {
        return res.status(401).json({
            message: 'You are not authorized to access this application'
        });
    },
    logout: async (req, res) => {
        const sessionUser = req.session.userId;
        // Clear the `userId` property from this session.
        if (req.session && req.session.userId) {
            delete req.session.userId;
        }

        // remove the XSRF cookie
        res.clearCookie('XSRF-TOKEN');
        return res.status(200).json({
            message: `User: ${sessionUser}, has been successfully logged out of the TOMIS application`
        });
    }
}