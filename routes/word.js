const express = require('express');
const router = express.Router();

var entry = {
  word: "word",
  definition: "definition",
  date: 0,
  etymology: "etymology"
};

router.all('/:word', function(req, res) {
  entry.word = req.params.word;
  res.render('index', { entry });
})

module.exports = router;