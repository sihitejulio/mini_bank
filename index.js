
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const expressHealthcheck = require('express-healthcheck');
const { mini_bank } = require('./config/db');
const app = express();
const createLogger = require('./utils/logger');
const port = process.env.PORT || 3010;
const {users_route} = require('./router')
const { schemaUserUpdate } = require('./utils/joi-schema/user-schema');
const validator = require('express-joi-validation').createValidator({
    passError: true
});

const logger = createLogger('index');
      
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/healthcheck', expressHealthcheck({
    healthy: () => ({ status: 'ok' }),
    test: async (callback) => {
      try {
        await mini_bank.authenticate();
        callback();
      } catch (error) {
          console.log(error);
        callback({ status: 'error' });
      }
    },
}));

app.use('/users', validator.body(schemaUserUpdate), users_route);
app.use((err, req, res, next) => {
  if (err && err.error && err.error.isJoi) {
    // we had a joi error, let's return a custom 400 json response
    res.status(400).json({
      type: err.type, // will be "query" here, but could be "headers", "body", or "params"
      message: err.error.toString()
    });
  } else {
    // pass on to another error handler
    next(err);
  }
});

const server = app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`)
})

module.exports = server