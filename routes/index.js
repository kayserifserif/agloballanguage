var express = require('express');
var router = express.Router();

var https = require('https');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var concat = require('concat-stream');
var util = require('util');

var word = 'ketchup';
var entry = {"word":"", "etymology":"", "date":null, "definition":""};

parser.on('error', function(err) {
  console.log('Parser error', err);
});

/* GET home page. */
router.get('/', function(req, res, next) {

  var url = 'https://www.dictionaryapi.com/api/v1/references/collegiate/xml/' +
  word + '?key=387115b8-0a9e-464f-8f56-1e4a6f46f7f1';

  https.get(url, function(resp) {

    resp.on('error', function(err) {
      console.log('Error while reading', err);
    });

    resp.pipe(
      concat(function(buffer) {
        var str = buffer.toString();
        parser.parseString(str, function(err, result) {
          var entry_list = result.entry_list;
          var entries = entry_list.entry;
          var first_entry = entries[0];
          var ew = first_entry.ew[0];
          // console.log('Word: ' + word);
          var et = first_entry.et[0];
          // console.log('Etymology: ' + util.inspect(et));
          var def = first_entry.def[0];
          var date = def.date[0];
          // console.log('Date: ' + date);
          var dt = def.dt[0];
          // console.log('Definition: ' + util.inspect(dt));

          entry["word"] = ew;
          entry["etymology"] = et;
          entry["date"] = date;
          entry["definition"] = dt;
        });
      })
    );

    // console.log(entry);

  });

  res.render('index', {
    title: 'Etymologee',
    entry: entry
  });

});

router.post('/input', function(req, res, next) {
  word = req.body.word;
  res.redirect('/');
});

module.exports = router;
