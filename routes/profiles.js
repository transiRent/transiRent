const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');
const { loginCheck } = require('./middlewares');
const {
  uploader,
  cloudinary
} = require('../config/cloudinary');

router.get('/',loginCheck(), (req, res, next) => {
  const currentUser = req.user;
  res.render('users/viewProfile', {
    user: currentUser
  })
});

router.get('/edit',loginCheck(), (req, res, next) => {
  const currentUser = req.user;
  res.render('users/editProfile', {
    user: currentUser
  })
});

router.get('/:id',loginCheck(), (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      var firstFiveRatings = [];
      var count = 0;
      if(user.ratings.length<=5){count = user.ratings.length}
      else{count = 5}
      for(let i = 0; i<count; i++){
        firstFiveRatings.push(user.ratings[i]);
        // count++;
        console.log('doing it')
      }
      console.log(firstFiveRatings)
      Offer.findOne({
        owner: user._id
      }).then(offers =>
        res.render('users/userInfo', {
          user: req.user,
          userInfo: user,
          offersInfo: offers,
          ratingsInfo: firstFiveRatings
        })
      )
    })
    .catch(err => next(err));
})

router.get('/rate/:id',loginCheck(), (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      res.render('users/userRating', {
        user: req.user,
        userInfo: user
      })
    })
    .catch(err => {
      next(err)
    })
})

router.post('/rate/:id/',loginCheck(), (req,res,next)=>{
  const currentUser = req.user; 
  const {rating, comments} = req.body;
  User.findById(req.params.id)
  .then(user=>{
    console.log(currentUser._id, user._id)
    if(String(currentUser._id) === String(user._id)){
      res.render(`users/userRating`, { user: req.user, message:'cannot rate your self!'})
      return;
    } 
    if(haveIRatedBefore(currentUser._id,user.ratings)){
      res.render(`users/userRating`, { user: req.user, message:'you have already rated this user'})
      return;
    }

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

router.post('/edit',loginCheck(), uploader.single('photo'), (req, res, next) => {
  const currentUser = req.user;
  const {
    firstName,
    lastName,
    description
  } = req.body;
  if (req.file) {
    User.findByIdAndUpdate(currentUser._id, {
        firstName: firstName,
        lastName: lastName,
        description: description,
        imgPath: req.file.path,
        imgName: req.file.originalname,
        publicId: req.file.filename
      })
      .then(user => {
        res.redirect(`/profiles/${user._id}`);
      })
      .catch(err => {
        next(err);
      })
  } else {
    User.findByIdAndUpdate(currentUser._id, {
      firstName: firstName,
      lastName: lastName,
      description: description
    })
    .then(user => {
      res.redirect(`/profiles/${user._id}`);
    })
    .catch(err => {
      next(err);
    })
  }
})

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

function average(arrayOfRatings, newestRating){
  let count = 0;
 for(let i = 0; i<arrayOfRatings.length; i++){
    count += arrayOfRatings[i].rating;
 }
  return Math.round((count+parseInt(newestRating))/(arrayOfRatings.length+1));
}
function haveIRatedBefore(id, ratingsArray){
  for(let i = 0; i < ratingsArray.length; i++){
    if(String(ratingsArray[i].ratedBy)===String(id)){return true;}
  }
  return false;
}

module.exports = router;