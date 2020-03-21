// api response for word input is passed through as my_entries
// my_entries is an array in which each element is an entry
// entries contain:
// date     (string)            detailed description of date
// date_str (string)            isolated date parsed from above
//                                (e.g. 1350 or 14th century)
// def      (array of strings)  word definitions
// etym     (string)            detailed description of
//                                origin and development of word
// origins  (object)            parsed from above, with languages as keys
//                                and lat/lon object as values
// pos      (string)            part of speech (e.g. "verb", "noun")
// word     (string)            the word as matched in the dictionary
// year     (int)               a further parsed date
//                                (e.g. converting "14th century" to 1350)

var langDescs = [
  "(Australian aboriginal language of northern Queensland)"
];
var relations = [
  "whence also", "; akin to", "; probably akin to"
];
var connections = [
  "borrowed from", "probably from", "perhaps from", "from", "going back to", "of"
];
var trimmed_origins = {};

const timeline_start = 1100;
const timeline_end = 2000;
// var year = 2000;
var date_el;
var date_x;

const height_normal = 0.05;
const height_peak = 0.2;

function parseEtym(entry, languages) {
  // get start-end indices for languages in etym
  var matches = entry.etym.matchAll(Object.keys(entry.origins).join("|"));
  var match_indices = [];
  for (var match of matches) {
    var startEnd = [match.index, match.index + match[0].length];
    match_indices.push(startEnd);
  }
  // use indices to parse languages and words into array
  console.log(entry.word);
  console.log(entry.etym);
  var etym_parsed = [];
  var isParsing = true;
  for (var i = 0; i < match_indices.length - 1; i++) {
    if (isParsing) {
      var pair = match_indices[i];
      var nextPair = match_indices[i + 1];
      var stage = [];
      var language = entry.etym.substring(pair[0], pair[1]).trim();
      stage.push(language);
      // trimmed_origins[language] = entry.origins[language];
      // var newLanguage = document.createElement("span");
      // newLanguage.id = "time" + (i + 1);
      // newLanguage.classList.add("time");
      // newLanguage.append(document.createTextNode(language));
      // languages.push(newLanguage);
      // var languageContainer = document.getElementById("languages");
      // languageContainer.append(newLanguage);
      var word = entry.etym.substring(pair[1], nextPair[0]).trim();
      // delete beginning comma
      if (word.startsWith(",")) {
        word = word.substring(1).trim();
      }
      // delete language descriptions
      for (var langDesc of langDescs) {
        word = word.replace(langDesc, "").trim();
      }
      // delete parentheses
      word = word.replace("(", "");
      word = word.replace(")", "");
      // if the word itself is a connection
      if (connections.includes(word)) {
        etym_parsed.push(stage);
        etym_parsed.push(word);
      } else { // check if word ends with a connection
        var wordHasConnection = false;
        for (var connection of connections) {
          if (!wordHasConnection) {
            if (word.endsWith(connection)) {
              wordHasConnection = true;
              var trimmed_word = word.substring(0, word.length - connection.length).trim();
              // delete ending comma
              if (trimmed_word.endsWith(",")) {
                trimmed_word = trimmed_word.substring(0, trimmed_word.length - 1);
              } else if (trimmed_word.endsWith(",</i>")) {
                trimmed_word = trimmed_word.substring(0, trimmed_word.length - 5) + "</i>";
              } else if (trimmed_word.endsWith(",\"")) {
                trimmed_word = trimmed_word.substring(0, trimmed_word.length - 2) + "\"";
              }
              stage.push(trimmed_word);
              etym_parsed.push(stage);
              if (connection === "of") {
                connection = "of origin";
              }
              etym_parsed.push(connection);
            }
          }
        }
        // if relation found, delete everything after
        for (var relation of relations) {
          var index = word.search(relation);
          if (index != -1) {
            word = word.substring(0, index);
            if (word != "origin") {
              stage.push(word);
            }
            etym_parsed.push(stage);
            isParsing = false;
          }
        }
        // if word contains no connection or relation, push as usual
        if (!wordHasConnection && isParsing) {
          etym_parsed.push(stage);
        }
      }
    }
  }
  if (isParsing) {
    var pair = match_indices[match_indices.length - 1];
    var stage = [];
    var language = entry.etym.substring(pair[0], pair[1]).trim();
    stage.push(language);
    var word = entry.etym.substring(pair[1]).trim();
    // delete language descriptions
    for (var langDesc of langDescs) {
      word = word.replace(langDesc, "").trim();
    }
    // delete parentheses
    word = word.replace("(", "");
    word = word.replace(")", "");
    stage.push(word);
    etym_parsed.push(stage);
  }

  // re-parse for repeats
  etym_trimmed = [];
  etym_parsed.forEach((x) => {
    if (!Array.isArray(x)) {
      etym_trimmed.push(x);
    } else {
      duplicateLangEntry = null;
      etym_trimmed.forEach((y) => {
        if (Array.isArray(y) && x[0] == y[0]) {
          duplicateLangEntry = y;
        }
      });
      if (duplicateLangEntry) {
        if (x.length > duplicateLangEntry.length) {
          etym_trimmed = etym_trimmed.filter(e => !Array.isArray(e) || e[0] !== x[0]);
          etym_trimmed.push(x);
        }
      } else {
        etym_trimmed.push(x);
      }
    }
  });

  return etym_trimmed;
}

function createGraphics() {

  // initialise globe
  var container = document.getElementById("container");
  var globe = new DAT.Globe(container);

  // get first entry
  var entry = my_entries[0];
  var hasOrigins = Object.keys(entry.origins).length > 0;

  // populate stages
  var stages = document.getElementById("stages");
  if (hasOrigins) {

    // show stages
    stages.style.visibility = "visible";
  
    // parse etymology
    var languages = [];
    etym_parsed = parseEtym(entry, languages);
    console.log(etym_parsed);

    // insert data into page
    var connectionContainer = document.getElementById("connections");
    var languageContainer = document.getElementById("languages");
    var wordsContainer = document.getElementById("words");
    for (var i = etym_parsed.length - 1; i >= 0; i--) {
      if (Array.isArray(etym_parsed[i])) {
        var language = etym_parsed[i][0];
        trimmed_origins[language] = entry.origins[language];
        var newLanguage = document.createElement("span");
        newLanguage.id = "time" + (i + 1);
        newLanguage.classList.add("time");
        var langSpan = document.createElement("span");
        langSpan.classList.add("language");
        langSpan.append(document.createTextNode(language));
        newLanguage.append(langSpan);
        languages.push(newLanguage);
        languageContainer.append(newLanguage);

        var word = etym_parsed[i][1];
        if (!word) {
          word = "";
        }
        var newWord = document.createElement("span");
        newWord.id = "word" + (i + 1);
        newWord.classList.add("word");
        newWord.innerHTML = word;
        wordsContainer.append(newWord);
      } else {
        var connection = etym_parsed[i];
        var newConnection = document.createElement("span");
        newConnection.classList.add("connection");
        newConnection.append(document.createTextNode(connection));
        languages[languages.length - 1].append(newConnection);
      }
    }

    // set tweens
    var settime = function(globe, t) {
      return function() {
        new TWEEN.Tween(globe).to({time: t/languages.length}, 500).easing(TWEEN.Easing.Cubic.EaseOut).start();
        var time_el = languages[t];
        if (time_el.classList.contains("active")) {
          return;
        }
        var time_els = document.getElementsByClassName("time");
        for (var i = 0; i < time_els.length; i++) {
          time_els[i].classList.remove("active");
        }
        time_el.classList.add("active");
      }
    }
    for (var i = 0; i < languages.length; i++) {
      languages[i].addEventListener("mouseover", settime(globe, i), false);
    }
    TWEEN.start();

    if (Object.keys(trimmed_origins).length > 0) {
      Object.entries(trimmed_origins).forEach(([key_i, value_i], i) => {
        var current_data = [];
        Object.entries(trimmed_origins).forEach(([key_j, value_j], j) => {
          current_data.push(value_j[0]);
          current_data.push(value_j[1]);
          if (i == j) {
            current_data.push(height_peak);
          } else {
            current_data.push(height_normal);
          }
        });
        globe.addData(current_data, {format: "magnitude", name: key_i, animated: true});
      });
    }

    // create globe
    globe.createPoints();
    // if (hasOrigins) {
      settime(globe, 0)();
    // }
    globe.animate();

  } else {
    stages.style.visibility = "hidden";
  }

  // mark date on timeline
  var timeline = document.getElementById("timeline");
  date_el = null;
  date_x = null;
  if (entry.year) {
    timeline.style.visibility = "visible";
    date_x = (
      (entry.year - timeline_start) / (timeline_end - timeline_start))
      * window.innerWidth;
    date_el = document.createElement("span");
    date_el.append(document.createTextNode(entry.date_str));
    date_el.id = "date_marker";
    date_el.style.left = date_x + "px";
    timeline.append(date_el);
  } else {
    timeline.style.visibility = "hidden";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  } else {
    createGraphics();
  }
});

window.addEventListener("resize", function() {
  if (date_el && date_x) {
    date_x = (
      (entry.year - timeline_start) / (timeline_end - timeline_start))
      * window.innerWidth;
    date_el.style.left = date_x + "px";
  }
});
