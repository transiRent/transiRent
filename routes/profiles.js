const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');

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

router.post('/edit', (req, res, next) => {
  const currentUser = req.user;
  const {
    firstName,
    lastName,
    description
  } = req.body;
  // console.log(currentUser._id);
  User.findByIdAndUpdate(currentUser._id, {
    firstName: firstName,
    lastName: lastName,
    description: description
  })
    .then(user => {
      res.redirect('/profiles');
    })
    .catch(err=>{
      next(err);
    })
})

module.exports = router;