const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');
const { loginCheck } = require('./middlewares');
const { uploader, cloudinary } = require('../config/cloudinary');

router.get('/', (req, res, next) => {
  Offer.find().populate('owner bookedBy')
    .then(offers => {
      res.render('offers/index', { offers });
    })
    .catch(err => {
      next(err);
    });
});

router.get('/create', loginCheck(), (req, res) => {
  res.render('offers/create');
});

router.post('/create', loginCheck(), uploader.single('photo'), (req, res, next) => {
  const { name, type, description, street, number, code, city, times } = req.body;
  if (!name) {
    res.render('offers/create', { message: 'Please enter a title' })
    return
  }
  if (!description) {
    res.render('offers/create', { message: 'Please enter a description' })
    return
  }
  if (!street || !number || !code || !city) {
    res.render('offers/create', { message: 'Please enter a address' })
    return
  }
  if (!times) {
    res.render('offers/create', { message: 'Please add timeslots' })
    return
  }
  let imgPath = "";
  let imgName = "";
  let publicId = "";
  if (req.file) {
   imgPath = req.file.path;
   imgName = req.file.originalname;
   publicId = req.file.filename;
  }
  const timeslots = times.map(t => {
    return { time: `${t}`, status: 'free', bookedBy: null };
  });
  const owner = req.user;
  const address = {
    street,
    number,
    code,
    city
  };
  Offer.create({ name, type, description, imgPath, imgName, publicId, address, owner, timeslots })
    .then(() => {
      res.redirect('/');
    })
    .catch(err => {
      next(err);
    });
});

router.get('/:id', (req, res, next) => {
  Offer.findById(req.params.id)
    .populate('owner bookedBy')
    .then(offer => {
      const times = offer.timeslots.map(t => {
        const date = new Date(t.time);
        return { day: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`, hour: `${date.getHours()}`, time: `${t.time}`, status: t.status, bookedBy: t.bookedBy, _id: t._id };
      });
      const dates = new Set(times.map(time => time.day));
      let output = '';
      for (date of dates) {
        output += `<div class="card mb-3">
                    <div class="card-header">
                      <h5 class="card-title">${date}</h5>
                    </div>
                    <div class="card-body">`;
        for (time of times) {
          if (time.day === date) {
            let disabled = '';
            if (time.status === 'booked') disabled = 'disabled';
            output += `<input type="checkbox" class="btn-check" name="time" id="${time._id}" value="${time._id}" autocomplete="off" ${disabled}>
                       <label class="btn btn-outline-primary" for="${time._id}">${time.hour}:00</label>`
          }
        }
        output += `</div></div>`;
      }
      res.render('offers/view', { offer, output });
    })
    .catch(err => {
      next(err);
    });
});

router.post('/:id/book', loginCheck(), (req, res, next) => {
  if (!req.body.time) {
    Offer.findById(req.params.id)
    .populate('owner bookedBy')
    .then(offer => {
      const times = offer.timeslots.map(t => {
        const date = new Date(t.time);
        return { day: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`, hour: `${date.getHours()}`, time: `${t.time}`, status: t.status, bookedBy: t.bookedBy, _id: t._id };
      });
      const dates = new Set(times.map(time => time.day));
      let output = '';
      for (date of dates) {
        output += `<div class="card mb-3">
                    <div class="card-header">
                      <h5 class="card-title">${date}</h5>
                    </div>
                    <div class="card-body">`;
        for (time of times) {
          if (time.day === date) {
            let disabled = '';
            if (time.status === 'booked') disabled = 'disabled';
            output += `<input type="checkbox" class="btn-check" name="time" id="${time._id}" value="${time._id}" autocomplete="off" ${disabled}>
                       <label class="btn btn-outline-primary" for="${time._id}">${time.hour}:00</label>`
          }
        }
        output += `</div></div>`;
      }
      res.render('offers/view', { offer, output, message: 'Please select timeslots' });
    })
    .catch(err => {
      next(err);
    });
    return
  }
  Offer.findById(req.params.id)
    .then(offer => {
      const modified = offer.timeslots.map(times => req.body.time.includes(times._id.toString()) ? { _id: times._id, time: times.time, status: 'booked', bookedBy: req.user._id } : times)
      console.log(modified);
      Offer.findByIdAndUpdate(req.params.id, { timeslots: modified})
        .then(() => {
          res.redirect('/');
        })
        .catch(err => {
          next(err);
        });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;