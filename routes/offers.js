const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');
const { loginCheck } = require('./middlewares');
const { uploader, cloudinary } = require('../config/cloudinary');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

router.get('/', (req, res, next) => {
  Offer.find().populate('owner bookedBy')
    .then(offers => {
      res.render('offers/index', { user: req.user, offers });
    })
    .catch(err => {
      next(err);
    });
});

router.get('/create', loginCheck(), (req, res) => {
  res.render('offers/create', { user: req.user });
});

router.post('/create', loginCheck(), uploader.single('photo'), (req, res, next) => {
  const { name, type, description, street, number, code, city, times, price } = req.body;
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
  let timeslots;
  if (typeof times === 'string') {
    timeslots = [{ time: `${times}`, status: 'free', bookedBy: null }];
  } else {
    timeslots = times.map(t => {
      return { time: `${t}`, status: 'free', bookedBy: null };
    });
  }
  const owner = req.user;
  const address = {
    street,
    number,
    code,
    city
  };
  Offer.create({ name, type, description, imgPath, imgName, publicId, address, owner, timeslots, price })
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
      if (req.user && offer.owner._id.toString() === req.user._id.toString()) {
        res.redirect(`${req.params.id}/edit`);
        return
      } else {
        for (let date of dates) {
          output += `<div class="card mb-3">
                      <div class="card-header">
                        <h5 class="card-title">${weekdays[new Date(date).getDay()]}, ${date}</h5>
                      </div>
                      <div class="card-body">`;
          for (let time of times) {
            if (time.day === date) {
              let disabled = '';
              if (time.status === 'booked') disabled = 'disabled';
              output += `<input type="checkbox" class="btn-check mb-1" name="time" id="${time._id}" value="${time._id}" autocomplete="off" ${disabled}>
                         <label class="btn btn-outline-primary mb-1" for="${time._id}">${time.hour}:00</label>`
            }
          }
          output += `</div></div>`;
        }
        output += '<button type="submit" class="btn btn-primary btn-lg">Book</button>';
      }
      res.render('offers/view', { user: req.user, offer, output });
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
      for (let date of dates) {
        output += `<div class="card mb-3">
                    <div class="card-header">
                      <h5 class="card-title">${weekdays[new Date(date).getDay()]}, ${date}</h5>
                    </div>
                    <div class="card-body">`;
        for (let time of times) {
          if (time.day === date) {
            let checked = '';
            if (time.status === 'booked') checked = 'checked';
            output += `<input type="checkbox" class="btn-check mb-1" name="time" id="${time._id}" value="${time._id}" autocomplete="off" ${checked} disabled>
                       <label class="btn btn-outline-primary mb-1" for="${time._id}">${time.hour}:00</label>`
          }
        }
        output += `</div></div>`;
      }
      res.render('offers/view', { user: req.user, offer, output, message: 'Please select timeslots' });
    })
    .catch(err => {
      next(err);
    });
    return
  }
  Offer.findById(req.params.id)
    .then(offer => {
      const booked = offer.timeslots.map(times => req.body.time.includes(times._id.toString()) ? { _id: times._id, time: times.time, status: 'booked', bookedBy: req.user._id } : times);
      Offer.findByIdAndUpdate(req.params.id, { timeslots: booked})
        .then(() => {
          res.redirect('/dashboard');
        })
        .catch(err => {
          next(err);
        });
    })
    .catch(err => {
      next(err);
    });
});

router.post('/:id/delete', loginCheck(), (req, res, next) => {
  Offer.findById(req.params.id)
  .populate('owner bookedBy')
  .then(offer => {
    if (offer.owner._id.toString() === req.user._id.toString()) {
      Offer.findByIdAndDelete(req.params.id)
      .then(() => {
        res.redirect('/dashboard');
      })
      .catch(err => {
        next(err);
      })
    }
  })
  .catch(err => {
    next(err);
  });
});

router.get('/:id/edit', (req, res, next) => {
  Offer.findById(req.params.id)
    .populate('owner bookedBy')
    .then(offer => {
      const times = offer.timeslots.map(t => {
        const date = new Date(t.time);
        return { day: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`, hour: `${date.getHours()}`, time: `${t.time}`, status: t.status, bookedBy: t.bookedBy, _id: t._id };
      });
      const dates = new Set(times.map(time => time.day));
      let output = '';
      if (req.user && offer.owner._id.toString() === req.user._id.toString()) {
        for (let date of dates) {
          output += `<div class="card mb-3">
                      <div class="card-header">
                        <h5 class="card-title">${weekdays[new Date(date).getDay()]}, ${date}</h5>
                      </div>
                      <div class="card-body">`;
          for (let time of times) {
            if (time.day === date) {
              let color = 'primary'
              if (time.status === 'booked') color = 'warning';
              output += `<input type="checkbox" class="btn-check mb-1" name="times" id="${time.time}" value="${time.time}" autocomplete="off" checked>
                         <label class="btn btn-outline-${color} mb-1" for="${time.time}">${time.hour}:00</label>`
            }
          }
          output += `</div></div>`;
        }
      }
      let appartment, room, sofa, closet, table, storage, other = ''
      if(offer.type === 'whole appartment') appartment = 'checked'; 
      if(offer.type === 'room') room = 'checked';
      if(offer.type === 'sofa') sofa = 'checked';
      if(offer.type === 'closet') closet = 'checked';
      if(offer.type === 'table') table = 'checked';
      if(offer.type === 'storage compartment') storage = 'checked';
      if(offer.type === 'other') other = 'checked';
      res.render('offers/edit', { user: req.user, offer, output, appartment, room, sofa, closet, table, storage, other });
    })
    .catch(err => {
      next(err);
    });
});

router.post('/:id/edit', loginCheck(), uploader.single('photo'), (req, res, next) => {
  Offer.findById(req.params.id)
  .then(offer => {
    const { name, type, description, street, number, code, city, times, price } = req.body;
    let booked = offer.timeslots.filter(timeslot => timeslot.status === 'booked');
    let timeslots;
    if (typeof times === 'string') {
      timeslots = booked;
    } else {
      timeslots = times.map(t => {
        return { time: `${t}`, status: 'free', bookedBy: null };
      });
      for (let bookedTimeslot of booked) {
        for (let timeslot of timeslots) {
          if (bookedTimeslot.time == timeslot.time) {
            timeslot.status = 'booked';
            timeslot.bookedBy = bookedTimeslot.bookedBy;
          }
        }
      }
    }
    const owner = req.user;
    const address = {
      street,
      number,
      code,
      city
    }
    if (req.file) {
      const imgPath = req.file.path;
      const imgName = req.file.originalname;
      const publicId = req.file.filename;
      Offer.findByIdAndUpdate(req.params.id, { name, type, description, imgPath, imgName, publicId, address, timeslots, price })
        .then(() => {
          res.redirect('/dashboard');
        })
        .catch(err => {
          next(err);
        });
    } else {
      Offer.findByIdAndUpdate(req.params.id, { name, type, description, address, timeslots, price })
      .then(() => {
        res.redirect('/dashboard');
      })
      .catch(err => {
        next(err);
      });
    } 
  })
  .catch(err => {
    next(err);
  });
});

router.post('/:id/cancel', loginCheck(), (req, res, next) => {
  Offer.findById(req.params.id)
  .then(offer => {
    let timeslots = offer.timeslots;
    for (let timeslot of timeslots) {
      if (timeslot.bookedBy.toString() === req.user._id.toString()) {
        timeslot.status = 'free';
        timeslot.bookedBy = null;
      }
    }
    Offer.findByIdAndUpdate(req.params.id, { timeslots })
    .then(() => {
      res.redirect('/dashboard');
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