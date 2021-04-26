const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');

router.get('/', (req, res, next) => {
  Movie.find().populate('owner bookedBy')
    .then(offers => {
      res.render('offers/index', { offers });
    })
    .catch(err => {
      next(err);
    });
});

router.get('/create', (req, res, next) => {
  res.render('offers/create');
});

module.exports = router;