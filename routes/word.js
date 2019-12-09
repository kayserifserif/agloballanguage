const express = require('express');
const router = express.Router();
var request = require('request');

var entry = {
  word: "word",
  pos: "pos",
  def: "def",
  etym: "etym",
  date: 0
};

router.all('/:word', function(req, res) {
  var url = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" +
    req.params.word + "?key=387115b8-0a9e-464f-8f56-1e4a6f46f7f1";
  request(url, function(error, response, body) {
    var json = JSON.parse(body);
    var first_entry = json[0];
    entry.word = first_entry.hwi.hw;
    entry.pos = first_entry.fl;
    entry.def = first_entry.shortdef[0];
    entry.etym = first_entry.et[0][1];
    entry.etym = entry.etym.replace(/{it}/g, "<i>");
    entry.etym = entry.etym.replace(/{\/it}/g, "<\/i>");
    entry.date = first_entry.date;
    console.log(entry);
  });
  res.render('index', { entry });
})

module.exports = router;