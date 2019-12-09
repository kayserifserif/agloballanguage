const express = require('express');
const router = express.Router();

var entry = {
  word: "word",
  pos: "pos",
  def: "def",
  etym: "etym",
  date: 0
};

router.get('/', function(req, res) {
  res.render('index', { entry });
});

router.post('/', function(req, res) {
  res.redirect('/word/' + req.body.word);
});

module.exports = router;