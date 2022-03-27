
require('dotenv').config()
const express = require('express');
const Queue = require('bull')
const path = require('path');
const bodyParser = require('body-parser');
const expressHealthcheck = require('express-healthcheck');
const { mini_bank } = require('./config/db');
const app = express();
const createLogger = require('./utils/logger');
const userQueue = require('./service/user-service');

const port = process.env.PORT || 3010;
const {users_route} = require('./router')
const OpenApiValidator = require('express-openapi-validator');
const swaggerUi = require('swagger-ui-express');
const yaml  = require('js-yaml');
const fs = require('fs');

const { createBullBoard } = require('@bull-board/api')
const { BullAdapter } = require('@bull-board/api/bullAdapter')
const { ExpressAdapter } = require('@bull-board/express')

const someQueue = new Queue('someQueueName')
const serverAdapter = new ExpressAdapter();

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(userQueue),
  ],
  serverAdapter:serverAdapter
})

const swaggerJsdoc = require('swagger-jsdoc');
// const { schemaUserUpdate } = require('./utils/joi-schema/user-schema');
const validator = require('express-joi-validation').createValidator({
    passError: true
});

const logger = createLogger('index');
// const swaggerDocument = require('./api.json');
// const apiSpec = path.join(__dirname, 'api.yaml');  
const apiSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hello World',
      version: '1.0.0',
    },
    servers: [{
      url:  '/v1'
    }]
  },
  apis: ['./*-api.yaml'], // files containing annotations as above
});

fs.writeFile('api-swagger.yaml', yaml.dump(apiSpec), () => 0);
// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: false }));
app.use(express.text());
app.use(express.json());


// parse application/json
// app.use(bodyParser.json())

app.use(
  OpenApiValidator.middleware({
    apiSpec,
    validateApiSpec: true,
    validateRequests: true, // (default)
    validateResponses: false, // false by default
  }),
);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec));

serverAdapter.setBasePath('/admin/queues')
app.use('/admin/queues', serverAdapter.getRouter());

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

app.use('/v1/users', users_route);
app.use('/transaction', users_route);
app.use((err, req, res, next) => {
  // if (err && err.error && err.error.isJoi) {
  //   // we had a joi error, let's return a custom 400 json response
  //   res.status(400).json({
  //     type: err.type, // will be "query" here, but could be "headers", "body", or "params"
  //     message: err.error.toString()
  //   });
  // } else {
  //   // pass on to another error handler
  //   next(err);
  // }
  console.log(err.status);

  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

const server = app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`)
})

module.exports = server