const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');

router.get('/', (req, res, next) => {
  Offer.find().populate('owner bookedBy')
    .then(offers => {
      res.render('offers/index', { offers });
    })
    .catch(err => {
      next(err);
    });
});

router.get('/create', (req, res) => {
  res.render('offers/create');
});

router.post('/create', (req, res, next) => {
  Offer.create(req.body)
    .then(() => {
      res.redirect('offers/index');
    })
    .catch(err => {
      next(err);
    });
});

router.get('/:id', (req, res, next) => {
  Offer.findById(req.params.id)
    .then(offer => {
      res.render('offers/view', { offer });
    })
    .catch(err => {
      next(err);
    });
});


router.post('/:id/book', (req, res, next) => {
  Offer.findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.redirect('/offers/index');
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;