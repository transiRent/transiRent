const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');
const { uploader, cloudinary } = require('../config/cloudinary');

router.get('/', (req, res, next) => {
  const currentUser = req.user;
  res.render('users/viewProfile', {
    user: currentUser
  })
});

router.get('/edit', (req, res, next) => {
  const currentUser = req.user;
  res.render('users/editProfile', {
    user: currentUser
  })
});

router.post('/edit', uploader.single('photo'), (req, res, next) => {
  console.log('here is the file ' + req.file)
  const currentUser = req.user;
  const {
    firstName,
    lastName,
    description
  } = req.body;
  const imgPath = req.file.path;
  const imgName = req.file.originalname;
  const publicId = req.file.filename;
  User.findByIdAndUpdate(currentUser._id, {
      firstName: firstName,
      lastName: lastName,
      description: description,
      imgPath: imgPath,
      imgName: imgName,
      publicId: publicId
    })
    .then(user => {
      res.redirect('/profiles');
    })
    .catch(err => {
      next(err);
    })
})

module.exports = router;