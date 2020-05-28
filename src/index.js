/* eslint-disable no-console */
'use strict';

const app = require('./app');
const port = process.env.PORT;
// the port env variable is provided by Heroku and locally by the application as well

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// index.js creates the express app and gets it up and running
// what the express app actually does is defined in the router files