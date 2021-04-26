const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');

router.get('/', (req,res,next)=>{
  const currentUser = req.user; 
  res.render('users/viewProfile', {user: currentUser})
});

module.exports = router; 