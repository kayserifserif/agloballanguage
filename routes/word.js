const express = require('express');
const router = express.Router();
const request = require('@root/request');
const fs = require('fs');
const origin_coords = require('../data/origin_coords.json')

const api = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
const key = "387115b8-0a9e-464f-8f56-1e4a6f46f7f1";

router.all("/:word_input", (req, res) => {
  console.log(req.params);
  console.log("Redirecting to sense 1");
  res.redirect("/word/" + req.params.word_input + "/1");
});

router.all('/:word_input/:sense', (req, res) => {
  console.log(req.params);
  var input = req.params.word_input;
  // https://www.dictionaryapi.com/api/v3/references/collegiate/json/typhoon?key=387115b8-0a9e-464f-8f56-1e4a6f46f7f1";
  var url = api + input + "?key=" + key;
  var sense = parseInt(req.params.sense);
  // if sense is not a number
  if (Number.isNaN(sense)) {
    console.log("NaN, redirecting to sense 1");
    res.redirect("/word/" + input + "/1");
  } else {
    request(url, function(error, response, body) {
      var entry = getEntry(body, input, sense);
      console.log(entry);
      if (entry) {
        res.render("word", { entry });
      } else if (sense != 1) {
        // try sense 1
        console.log("Trying sense 1, redirecting");
        res.redirect("/word/" + input + "/1");
      } else {
        res.render('error', { word: input });
      }
    });
  }
})

function getEntry(body, input, sense) {
  if (body.length <= 2) {
    return null;
  }
  var json = JSON.parse(body);
  console.log(json);
  if (typeof json[0] === "string" || sense > json.length) {
    return null;
  }
  var entry = {};
  var isMatchFound = false;
  var senseEntry = json[sense - 1];
  var id = /[^:0-9]*/g.exec(senseEntry.meta.id);
  if (id && id[0].toLowerCase() === input.toLowerCase()) {
    isMatchFound = true;

    // word
    entry.word = id[0];
    
    // part of speech
    entry.pos = senseEntry.fl;
    
    // definition
    entry.def = senseEntry.shortdef;
    
    // etymology
    if (senseEntry.hasOwnProperty("et")) {
      entry.etym = senseEntry.et[0][1];
      // italics
      entry.etym = entry.etym.replace(/{it}/g, "<i>");
      entry.etym = entry.etym.replace(/{\/it}/g, "<\/i>");
      // more at
      entry.etym = entry.etym.replace(/{ma}/g, "—more at ");
      entry.etym = entry.etym.replace(/{mat\|(-?\w+-?)(?::(\d))?\|}/g,
        (match, p1, p2) => {
          if (p2) {
            return "<a href=\"/word/" + p1 + "/" + p2 + "\">" + p1 + " entry " + p2 + "</a>"
          } else {
            return "<a href=\"/word/" + p1 + "\">" + p1 + "</a>";
          }
        });
      entry.etym = entry.etym.replace(/{\/ma}/g, "");
      // etymology link
      entry.etym = entry.etym.replace(/{et_link\|(-?\w+-?)(?::(\d))?\|(?:(-?\w+-?)(?::(\d))?)?}/g,
        (match, p1, p2) => {
          if (p2) {
            return "(<a href=\"/word/" + p1 + "/" + p2 + "\">" + p1 + " entry " + p2 + "</a>)";
          } else {
            return "(<a href=\"/word/" + p1 + "\">" + p1 + "</a>)";
          }
        });
    }

    // coords
    if (entry.etym) {
      var origins = {};
      for (var language in origin_coords) {
        if (entry.etym.search(language) != -1) {
          origins[language] = Object.values(origin_coords[language]);
        }
      }
      entry.origins = origins;
    } else {
      entry.origins = {};
    }
    
    // date
    entry.date = senseEntry.date;
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
      entry.date_str = date_str;
      var date_word = date_str.match(/\d+[^ ]*/g)[0]; // word containing date
      var year = Number(date_word); // try converting to number
      if (isNaN(year)) { // set to middle of century
        year = (parseInt(date_word) - 1) * 100 + 50;
      }
      entry.year = year;
    }
  }
  if (!isMatchFound) {
    return null;
  }
  // success
  return entry;
}

module.exports = router;