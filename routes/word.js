const express = require('express');
const router = express.Router();
var request = require('request');

router.all('/:word', function(req, res) {
  var url = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" +
    req.params.word + "?key=387115b8-0a9e-464f-8f56-1e4a6f46f7f1";
  var entries = [];
  request(url, function(error, response, body) {
    var json = JSON.parse(body);
    for (var entry_num = 0; entry_num < json.length; entry_num++) {
      var id = /[^:0-9]*/g.exec(json[entry_num].meta.id);
      if (id && id[0] === req.params.word) {
        var entry = {};

        // entry.word = json[entry_num].hwi.hw; // headword info, headword
        entry.word = id[0];
        
        entry.pos = json[entry_num].fl; // functional label
        
        entry.def = json[entry_num].shortdef;
        
        if (json[entry_num].hasOwnProperty("et")) {
          entry.etym = json[entry_num].et[0][1];
          entry.etym = entry.etym.replace(/{it}/g, "<i>");
          entry.etym = entry.etym.replace(/{\/it}/g, "<\/i>");
        }
        
        entry.date = json[entry_num].date;
        var ds = /{[^}]*}/g.exec(entry.date); // date sense
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
        
        entries.push(entry);
      }
    }
    console.log(entries);
  });
  res.render('index', { entries });
})

module.exports = router;