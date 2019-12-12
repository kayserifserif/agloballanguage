const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const origin_coords = require('../data/origin_coords.json')

router.all('/:word_input', function(req, res) {
  var url = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" +
    req.params.word_input + "?key=387115b8-0a9e-464f-8f56-1e4a6f46f7f1";
  request(url, function(error, response, body) {
    var entries = getEntries(body, req.params.word_input);
    console.log(entries);
    res.render('word', { entries });
  });
})

function getEntries(body, word_input) {
  var entries = [];
  var json = JSON.parse(body);
  for (var entry_num = 0; entry_num < json.length; entry_num++) {
    var id = /[^:0-9]*/g.exec(json[entry_num].meta.id);
    if (id && id[0].toLowerCase() === word_input.toLowerCase()) {
      var entry = {};

      entry.word = id[0];
      
      entry.pos = json[entry_num].fl; // functional label
      
      entry.def = json[entry_num].shortdef;
      
      // etymology
      if (json[entry_num].hasOwnProperty("et")) {
        entry.etym = json[entry_num].et[0][1];
        // italics
        entry.etym = entry.etym.replace(/{it}/g, "<i>");
        entry.etym = entry.etym.replace(/{\/it}/g, "<\/i>");
      }

      // coords
      if (entry.etym) {
        var origins = {};
        for (var language in origin_coords) {
          var regexp = new RegExp(language);
          if (regexp.test(entry.etym)) {
            var origin = {
              "lat": origin_coords[language].lat,
              "lon": origin_coords[language].lon
            };
            origins[language] = origin;
          }
        }
        entry.origins = origins;
      }
      
      // date
      entry.date = json[entry_num].date;
      var ds = /{[^}]*}/g.exec(entry.date); // date sense
      if (ds) {
        var dss = ds[0].split(/\||{|}/g);
        entry.date = entry.date.replace(/{[^}]*}/g, "");
        var ds_str = ", in the meaning defined at ";
        if (dss[2].length > 0) { // verb divider
          if (dss[2] === "t") {
            ds_str += "transitive ";
          } else if (dss[2] === "i") {
            ds_str += "intransitive ";
          }
        }
        ds_str += "sense ";
        if (dss[3].length > 0) { // bold sense number
          ds_str += "number " + dss[3];
        }
        if (dss[4].length > 0) { // lowercase letter sense number
          ds_str += dss[4];
        }
        if (dss[5].length > 0) { // parenthesized sense number
          ds_str += "(" + dss[5] + ")";
        }
        entry.date += ds_str;
      }

      // year
      if (entry.date) {
        var date_str = entry.date.split(",")[0]; // before date sense
        var date_word = date_str.match(/\d+[^ ]*/g)[0]; // word containing date
        var year = Number(date_word); // try converting to number
        if (isNaN(year)) { // set to middle of century
          year = (parseInt(date_word) - 1) * 100 + 50;
        }
        entry.year = year;
      }
      
      entries.push(entry);
    }
  }
  return entries;
}

module.exports = router;