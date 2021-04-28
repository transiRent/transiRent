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
  const currentUser = req.user; 
  const {rating, comments} = req.body;
  User.findById(req.params.id)
  .then(user=>{
    var newRating = {
      ratedBy: currentUser._id,
      rating: rating,
      comments: comments
    };
    var newAverageRating = 0;
    if(!user.averageRating){newAverageRating=parseInt(rating);}
    else{
      newAverageRating = average(user.ratings,newRating.rating);
    }
    User.findByIdAndUpdate(req.params.id,{$push:{ratings:newRating}, averageRating: newAverageRating})
    .then(res.redirect('/'))
    .catch(err=>{
      next(err)
    })
  })
})

router.post('/edit', uploader.single('photo'), (req, res, next) => {
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

function average(arrayOfRatings, newestRating){
  let count = 0;
 for(let i = 0; i<arrayOfRatings.length; i++){
    count += arrayOfRatings[i].rating;
 }
  return Math.round((count+parseInt(newestRating))/(arrayOfRatings.length+1));
}

router.post('/delete', (req, res, next) => {
  console.log(req.user)
  Offer.deleteMany({ owner: req.user._id })
    .then(() => {
      User.findOneAndDelete({_id: req.user._id})
        .then(() => {
          req.logout();
          req.session.destroy();
          res.redirect('/')
        })
        .catch(err => {
          next(err);
        })
    }) 
    .catch(err => {
      next(err);
    }) 
})

module.exports = router;