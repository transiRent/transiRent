const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');
const { loginCheck } = require('./middlewares');

/* GET home page */
router.get("/", (req, res, next) => {
  const currentUser = req.user;
  res.render("index", { user: currentUser });
});

router.get("/dashboard", (req, res, next) => {
  const currentUser = req.user;
  Offer.find({ owner: currentUser._id })
  .then(offers => {
    const modifiedOffers = offers.map(offer => {
      const times = offer.timeslots.map(t => {
        const date = new Date(t.time);
        return { day: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`, hour: `${date.getHours()}`, time: `${t.time}`, status: t.status, bookedBy: t.bookedBy, _id: t._id };
      });
      const dates = new Set(times.map(time => time.day));
      output = '';
      for (date of dates) {
        output += `<div class="card mb-3">
                    <div class="card-header">
                      <h5 class="card-title">${date}</h5>
                    </div>
                    <div class="card-body">`;
        for (time of times) {
          if (time.day === date) {
            let checked = '';
            if (time.status === 'booked') checked = 'checked';
            output += `<input type="checkbox" class="btn-check btn-sm" name="time" id="${time._id}" value="${time._id}" autocomplete="off" ${checked} disabled>
                       <label class="btn btn-outline-primary btn-sm" for="${time._id}">${time.hour}:00</label>`
          }
        }
        output += `</div></div>`;
      }
      return {
        address: offer.address,
        _id: offer._id,
        name: offer.name,
        type: offer.type,
        description: offer.description,
        imgPath: offer.imgPath,
        imgName: offer.imgName,
        publicId: offer.publicId,
        output
      };
    })
    Offer.find({ 'timeslots.bookedBy': currentUser._id })
      .then(bookings => {
        const modifiedBookings = bookings.map(booking => {
          const times = booking.timeslots.map(t => {
            if (t.bookedBy != null) {
              if (t.bookedBy.toString() === currentUser._id.toString()) {
                const date = new Date(t.time);
                return { day: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`, hour: `${date.getHours()}`, time: `${t.time}`, status: t.status, bookedBy: t.bookedBy, _id: t._id };
              }
            }
          });
          const filteredTimes = times.filter(time => time != null);
          const dates = new Set(filteredTimes.map(time => time.day));
          output = '';
          for (date of dates) {
            output += `<div class="card mb-3">
                        <div class="card-header">
                          <h5 class="card-title">${date}</h5>
                        </div>
                        <div class="card-body">`;
            for (time of filteredTimes) {
              if (time.day === date) {
                output += `<input type="checkbox" class="btn-check btn-sm" name="time" id="${time._id}" value="${time._id}" autocomplete="off" checked disabled>
                          <label class="btn btn-outline-primary btn-sm" for="${time._id}">${time.hour}:00</label>`
              }
            }
            output += `</div></div>`;
          }
          return {
            address: booking.address,
            _id: booking._id,
            name: booking.name,
            type: booking.type,
            description: booking.description,
            imgPath: booking.imgPath,
            imgName: booking.imgName,
            publicId: booking.publicId,
            output
          };
        })
        res.render('users/dashboard', { currentUser, modifiedOffers, modifiedBookings });
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