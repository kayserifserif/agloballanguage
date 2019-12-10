const express = require('express');
const router = express.Router();

var entries = [];

router.get('/', function(req, res) {
  res.render('index', { entries });
});

router.post('/', function(req, res) {
  if (req.body.word) {
    res.redirect('/word/' + req.body.word);
  }
  // else {
  //   res.render('index', { entries });
  // }
});

module.exports = router;