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
  const { name, type, description, adress, owner, times } = req.body;
  const timeslots = times.map(t => {
    return { time: `${t}`, status: 'free', bookedBy: null };
  });
  console.log(timeslots);
  Offer.create({ name, type, description, adress, owner, timeslots })
    .then(() => {
      res.redirect('/');
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
  console.log(req.body);
  Offer.findById(req.params.id)
    .then(offer => {
      const modified = offer.timeslots.map(times => req.body.time.includes(times._id.toString()) ? { _id: times._id, time: times.time, status: 'booked', bookedBy: null } : times)
      console.log(modified);
      Offer.findByIdAndUpdate(req.params.id, { timeslots: modified})
        .then(time => {
          console.log(time);
          res.redirect('/');
        })
        .catch(err => {
          next(err);
        });
    })
});

module.exports = router;