'use strict';

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

// mongoose creates
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number');
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error ('Your password cannot contain the word password');
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
    // allows us to store the buffer with our binary image data in the db alongside of the user who the image belongs to
  }
}, {
  timestamps: true
});

// virtual property, its not actual data stored in the db but its a relationship between two entities
// its virtual because were not actually changing what we store, its just a way for mongoose to figure out how these things are related
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id', // in this case would be the user id, which is associated with the task owner field
  foreignField: 'owner' // name of the field on the other thing, for this it would be on task
});

// methods are available on instances
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// res.send automatically calls JSON.stringify on whats being passed in
// toJSON manipulates the data sending back an object, just what we want to send back
userSchema.methods.toJSON = function () {
  // toJSON, use it to manipulate the object, sending back just the properties we want to expose
  const user = this;
  const userObject = user.toObject(); // toObject method available on mongoose

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// by setting up a value on statics, were setting that up as something we can access directly on model
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

// runs before an event
// here we are using a method on user schema to set the middleware up
userSchema.pre('save', async function (next) {
  // first arg is the name of the event, which in this case is save
  // second arg is the function to run during the event
  const user = this; 
  // this, gives us access to the individual user about to be saved
  // this, is equal to the document being saved

  // this is true when user is first created and 
  // when user is being updated and password is one of the things changed
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next(); // we call next when were done
});

// delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model('User', userSchema);
// we pass an object as the second arg to model
// behind the scenes mongoose converts it to a schema
// but we create the schema and pass it in

module.exports = User;