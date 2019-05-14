var express = require('express');
var router = express.Router();

var https = require('https');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var concat = require('concat-stream');
var util = require('util');
// var request = require('request');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var word = 'ketchup';
var entry = {"word": "", "etymology": "", "date": null, "definition": ""};

parser.on('error', function(err) {
  console.log('Parser error', err);
});

var getResults = function(req, res) {

  var url = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/' +
  word + '?key=387115b8-0a9e-464f-8f56-1e4a6f46f7f1';
  
  https.get(url, (res) => {
    res.on('data', (d) => {
      var jsonObject = JSON.parse(d);
      var first_entry = jsonObject[0];
      entry["word"] = first_entry["meta"]["id"];
      entry["definition"] = first_entry["shortdef"][0];
      entry["date"] = first_entry["date"];
      entry["etymology"] = first_entry["et"][0][1];
    });
  }).on('error', (e) => {
    console.error(e);
  });

  res.render('index', {
    title: 'Etymologee',
    entry: entry
  });

};

// /* GET home page. */
router.get('/', getResults);

// // router.post
router.get('/input', function(req, res) {
  word = req.query.word;
  // console.log(word);
  // res.redirect('/');
}, getResults);

module.exports = router;
