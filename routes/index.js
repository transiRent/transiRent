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
            }
            output += `<a href="/profiles/${time.bookedBy}" class="btn btn-${outline}primary btn-sm ${disabled} m-1" tabindex="-1" role="button">${time.hour}:00</a>`
          }
        }
        output += `</div></div>`;
      }
      output += `<form action="/offers/${offer._id}/delete" method="POST">
                    <a href="/offers/${offer._id}/edit" class="btn btn-primary btn-lg" tabindex="-1" role="button"><i class="bi bi-pencil-fill"></i></a>
                    <button type="submit" class="btn btn-danger btn-lg" ${offerBooked}><i class="bi bi-trash-fill"></i></button>
                 </form>`;
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
                          <h5 class="card-title">${weekdays[new Date(date).getDay()]}, ${date}</h5>
                        </div>
                        <div class="card-body">`;
            for (time of filteredTimes) {
              if (time.day === date) {
                output += `<a href="/profiles/${time.bookedBy}" class="btn btn-primary btn-sm disabled m-1" tabindex="-1" role="button">${time.hour}:00</a>`
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
        res.render('users/dashboard', { user: currentUser, modifiedOffers, modifiedBookings });
      })
      .catch(err => {
        next(err);
      });
  })
  .catch(err => {
    next(err);
  });
});


/* GET data from database */
router.get('/get-data', (req, res, next) => {
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
