'use strict';

const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch(e) {
    res.status(400).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token }); 
    // when we call res.send, JSON.stringify gets called on both the user and token
  } catch(e) {
    res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.status(200).send();
  } catch(e) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send();
  } catch(e) {
    res.status(500).send();
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

// router.get('/users/:id', async (req, res) => {
//   const _id = req.params.id;

//   try {
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).send();
//     }

//     res.send(user);
//   } catch(e) {
//     res.status(500).send(e);
//   }
// });

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every(update => {
    // every() method tests whether all elements in the array pass the test implemented by provided function, returns boolean
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates! '});
  }

  try {
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    // new: true will return the new user as opposed to the existing one that was found before the update
    // runValidators: true will make sure we run validation for the update

    // certain mongoose queries bypass more advanced features like middleware 
    // meaning if we want to use them consistently, we have to do a little restructuring
    
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch(e) {
    res.status(400).send(e);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove(); // remove method from mongoose
    sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch(e) {
    res.status(500).send();
  }
});

const upload = multer({
  // dest: 'avatar',
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, callback) {
    // allows us to filter files by file type
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('File must be jpg, jpeg, or in png format..'));
    } 

    callback(undefined, true);
  }
});

// for Creating and Updating avatars
// multer will look for a file called avatar based on string in .single
router.post('/users/me/avatar', auth, upload.single('avatar'), async  (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send(req.user);
  } catch(e) {
    res.status(500).send();
  }
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user || !user.avatar) {
      throw new Error('User and/or user avatar does not exist..');
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch(e) {
    res.status(404).send();
  }
});

module.exports = router;