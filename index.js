require('dotenv').config();
const express = require('express');
const expressSession = require('express-session');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
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
      const message = `
        The authentication token from Azure Active Directory is invalid or missing. 
        It evaluated to ${JSON.stringify(token)}
      `;
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

app.use(
	'/api/docs',
	(req, res, next) => {
    const swaggerDocument = YAML.load('./swagger/swagger.yaml');
		swaggerDocument.host = req.get('host');
		req.swaggerDoc = swaggerDocument;
		next();
	},
	swaggerUi.serve,
	swaggerUi.setup(),
);

app.use(function (req, res, next) {
  const whitelist = [
		'http://localhost:3000',
		'localhost:3000',
		'http://localhost:9000',
		'localhost:9000',
	];
  const host = req.headers.origin ? req.headers.origin : req.get('host');

  whitelist.forEach((origin) => {
    if (host.indexOf(origin) > -1) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
    }
  });
  
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization,X-Requested-With');

  return ('OPTIONS' == req.method) ? res.sendStatus(200) : next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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