const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  const currentUser = req.user;
  res.render("index", { user: currentUser });
});

module.exports = router;
