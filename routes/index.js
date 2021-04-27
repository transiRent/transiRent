const router = require("express").Router();
const Offer = require('../models/Offer');

/* GET home page */
router.get("/", (req, res, next) => {
  const currentUser = req.user;
  res.render("index", { user: currentUser });
});

/* GET data from database */
router.get('/get-data', (req, res, next) => {
  Offer.find()
  .then(allOffers => {
    console.log(allOffers)
    res.json(allOffers);
  })
  .catch(err => {
    next(err)
  }) 
})

module.exports = router;
