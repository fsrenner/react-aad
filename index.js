require('dotenv').config();
const express = require('express');
const expressSession = require('express-session');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;

const db = require('./db/sequelize');
const routes = require('./routes');
const config = require('./config/config');
const Logger = config.logger;

/**
 * The authStrategy function manages the passport Azure Active Directory Bearer
 * authentication strategy for the NOAA OCM Directory where TOMIS user authentication
 * information is stored. This is for authenticating users logging in using their Azure
 * Active Directory credentials.
 */
const authStrategy = new BearerStrategy(config.azure, (token, done) => {
    if (!token) {
      const message = `The authentication token from Azure Active Directory is invalid or missing. It evaluated to ${JSON.stringify(token)}`;
      console.log(message);
      done(new Error(message));
    } else {
      done(null,{}, token);
    }
  }
);

const app = express();
app.set('port', config.port);
app.set('query parser', true);

if (process.env.NODE_ENV === 'dev') {
  app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache');
    next();
  });
}

app.use(passport.initialize());
app.use(passport.session());
passport.use('user-authentication', authStrategy);

app.use(function (req, res, next) {

  // TODO: Don't let everything in in Prod. Testing purposes only.
  // const whitelist = ['http://localhost:4200', 'http://localhost:3000'];
  // const host = req.get('host');

  // whitelist.forEach((origin) => {
  //   if (host.indexOf(origin) > -1) {
  //     res.header('Access-Control-Allow-Origin', host);
  //   }
  // });
  
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization,X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  }
  else {
    next();
  }
});
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(expressSession(config.session));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public/build')));
app.use(routes);

const server = http.createServer(app);
server.listen(app.get('port'), async () => {
    Logger.info('Express server listening on port ' + server.address().port);

    // Initialize the sqlite database
    try {
        await db.init();
    } catch (e) {
        Logger.error(e.message, e);
        process.exit(1);
    }
})