
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const expressHealthcheck = require('express-healthcheck');
const { mini_bank } = require('./config/db');
const app = express();
const port = process.env.PORT || 3010;
const {users_route} = require('./router')

      
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

app.use('/users', users_route);


const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = server