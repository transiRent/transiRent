const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');
const {
  uploader,
  cloudinary
} = require('../config/cloudinary');

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

router.get('/:id', (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      Offer.findOne({
        owner: user._id
      }).then(offers =>
        res.render('users/userInfo', {
          userInfo: user,
          offersInfo: offers
        })
      )
    })
    .catch(err => next(err));
})

router.get('/rate/:id', (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      res.render('users/userRating', {
        userInfo: user
      })
    })
    .catch(err => {
      next(err)
    })
})

router.post('/rate/:id/', (req,res,next)=>{
  const {rating} = req.body;
  User.findById(req.params.id)
  .then(user=>{
    var newRating = 0;
    var newNumberOfRatings = 0;
    var newAverageRating = 0;
    if(!user.accumulatedRating){newRating=parseInt(rating)}
    else{newRating = parseInt(user.accumulatedRating) + parseInt(rating);}
    if(!user.numberOfRatings){newNumberOfRatings=1;}
    else{newNumberOfRatings = parseInt(user.numberOfRatings) + 1;}
    if(!user.averageRating){newAverageRating=parseInt(rating);}
    else{newAverageRating = Math.round(newRating/newNumberOfRatings);}

    console.log('here is the new average ' + newAverageRating)
    User.findByIdAndUpdate(req.params.id,{accumulatedRating:newRating, numberOfRatings: newNumberOfRatings, averageRating: newAverageRating})
    .then(res.redirect('/'))
    .catch(err=>{
      next(err)
    })
  })
})

router.post('/edit', uploader.single('photo'), (req, res, next) => {
  console.log('here is the file ' + req.file)
  const currentUser = req.user;
  const {
    firstName,
    lastName,
    description
  } = req.body;
  var imgPath = "";
  var imgName = "";
  var publicId = "";
  if (req.file) {
    console.log('there was a file')
    imgPath = req.file.path;
    imgName = req.file.originalname;
    publicId = req.file.filename;
  }
  User.findByIdAndUpdate(currentUser._id, {
      firstName: firstName,
      lastName: lastName,
      description: description,
      imgPath: imgPath,
      imgName: imgName,
      publicId: publicId
    })
    .then(user => {
      res.redirect('/profiles');
    })
    .catch(err => {
      next(err);
    })
})



module.exports = router;