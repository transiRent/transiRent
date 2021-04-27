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

router.get('/:id', (req,res,next)=>{
  // var usersOffers;
  // Offer.findOne({owner : req.params.id})
  // .then(offers=>usersOffers=JSON.parse(JSON.stringify(offers)))
  // .catch(err=>next(err))
  // console.log(usersOffers)
  User.findById(req.params.id)
  .then(user=>{
    Offer.findOne({owner : user._id}).then(offers=>
      res.render('users/userInfo', {
        userInfo : user, offersInfo: offers 
      })
    )
  })
  .catch(err=>next(err));
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