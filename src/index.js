'use strict';

const express = require('express');
require('./db/mongoose'); // calling require ensures that the file will run, ensures mongoose connects to the db
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const app = express();
const port = process.env.PORT;
// the port env variable is provided by Heroku and locally by the application as well

app.use(express.json()); // automatically parses incoming JSON as an object
app.use(userRouter); // registering the userRouter
app.use(taskRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// index.js creates the express app and gets it up and running
// what the express app actually does is defined in the router files