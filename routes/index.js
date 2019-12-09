const express = require('express');
const router = express.Router();

var entry = {};

router.get('/', function(req, res) {
  entry = {
    word: "word",
    definition: "definition",
    date: 0,
    etymology: "etymology"
  };
  res.render('index', { entry });
});

router.post('/', function(req, res) {
  res.redirect('/word/' + req.body.word);
});

router.all('/word/:word', function(req, res) {
  entry.word = req.params.word;
  res.render('index', { entry });
})

module.exports = router;