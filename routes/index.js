const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');
const { loginCheck } = require('./middlewares');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* GET home page */
router.get("/", (req, res, next) => {
  const currentUser = req.user;
  res.render("index", { user: currentUser });
});

router.get("/dashboard", loginCheck(), (req, res, next) => {
  User.findById(req.user._id)
  .populate('ratings.ratedBy')
  .then(currentUser => {
    Offer.find({ owner: currentUser._id })
    .then(offers => {
      const modifiedOffers = offers.map(offer => {
        const times = offer.timeslots.map(t => {
          const date = new Date(t.time);
          return { day: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`, hour: `${date.getHours()}`, time: `${t.time}`, status: t.status, bookedBy: t.bookedBy, _id: t._id };
        });
        const dates = new Set(times.map(time => time.day));
        output = '';
        let profit = 0;
        let offerBooked = '';
        for (date of dates) {
          output += `<div class="card mb-3">
                      <div class="card-header">
                        <h5 class="card-title">${weekdays[new Date(date).getDay()]}, ${date}</h5>
                      </div>
                      <div class="card-body">`;
          for (time of times) {
            if (time.day === date) {
              let disabled = 'disabled';
              let outline = 'outline-';
              if (time.status === 'booked') {
                offerBooked = 'disabled';
                disabled = '';
                outline = '';
                profit++;
              }
              output += `<a href="/profiles/${time.bookedBy}" class="btn btn-${outline}primary btn-sm ${disabled} m-1" tabindex="-1" role="button">${time.hour}:00</a>`
            }
          }
          output += `</div></div>`;
        }
        profit *= offer.price;
        return {
          address: offer.address,
          _id: offer._id,
          name: offer.name,
          type: offer.type,
          description: offer.description,
          imgPath: offer.imgPath,
          imgName: offer.imgName,
          publicId: offer.publicId,
          profit,
          output
        };
      })
      Offer.find({ 'timeslots.bookedBy': currentUser._id })
        .populate('owner')
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
            let cost = 0;
            for (date of dates) {
              output += `<div class="card mb-3">
                          <div class="card-header">
                            <h5 class="card-title">${weekdays[new Date(date).getDay()]}, ${date}</h5>
                          </div>
                          <div class="card-body">`;
              for (time of filteredTimes) {
                if (time.day === date) {
                  cost++;
                  output += `<a href="/offers/${booking._id}" class="btn btn-primary btn-sm m-1" tabindex="-1" role="button">${time.hour}:00</a>`
                }
              }
              output += `</div></div>`;
            }
            cost *= booking.price;
            return {
              address: booking.address,
              _id: booking._id,
              name: booking.name,
              type: booking.type,
              description: booking.description,
              owner: booking.owner,
              imgPath: booking.imgPath,
              imgName: booking.imgName,
              publicId: booking.publicId,
              cost,
              output
            };
          })
          res.render('users/dashboard', { user: currentUser, modifiedOffers, modifiedBookings });
        })
        .catch(err => {
          next(err);
        });
    })
    .catch(err => {
      next(err);
    });
  })
  .catch(err => {
    next(err)
  })
});


/* GET data from database */
router.get('/get-data', (req, res, next) => {
  console.log('get data')
  Offer.find()
  .then(allOffers => {
    // console.log(allOffers)
    res.json(allOffers);
  })
  .catch(err => {
    next(err)
  }) 
})

module.exports = router;
