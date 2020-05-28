'use strict';

const express = require('express');
require('./db/mongoose'); // calling require ensures that the file will run, ensures mongoose connects to the db
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const app = express();

app.use(express.json()); // automatically parses incoming JSON as an object
app.use(userRouter); // registering the userRouter
app.use(taskRouter);

// refactored, created app.js to allow us to use the express application without calling app.listen for testing purposes
module.exports = app;