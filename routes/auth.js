const router = require('express').Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcrypt');


//get signup page
router.get('/signup', (req, res, next) => {
  res.render('signup');
})

//route where signup form get's posted to
router.post('/signup', (req, res, next) => {
  const { username, password } = req.body;
  if (password.length < 6) {
    res.render('signup', { message: 'Your password has to be 6 chars min' })
    return
  }

  if (username === '') {
    res.render('signup', { message: 'Your username cannot be empty' });
    return
  }

  User.findOne({ username: username })
    .then(userFromDB => {
      if (userFromDB !== null) {
        res.render('signup', { message: 'This username is already taken' })
      } else {
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(password, salt);
        User.create({ username: username, password: hash })
          .then(createdUser => {
            res.redirect('/login')
          })
      }
    })
})

//get login page
router.get('/login', (req, res, next) => {
  res.render('login');
})

//route where login form get's posted to


module.exports = router;