const timeline_start = 1100;
const timeline_end = 2000;
var year = 2000;
var date_el;
var date_x;

const height_normal = 0.05;
const height_peak = 0.2;

window.onload = function() {

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  } else {

    // initialise globe
    var container = document.getElementById("container");
    var globe = new DAT.Globe(container);

    // get entry with longest etym
    var etym = "";
    var origin_langs = 0;
    var entry_num = 0;
    for (var i = 0; i < my_entries.length; i++) {
      if (my_entries[i].etym && my_entries[i].origins) {
        // if (my_entries[i].etym.length > etym.length) {
        if (Object.keys(my_entries[i].origins).length > origin_langs) {
          etym = my_entries[i].etym;
          origin_langs = Object.keys(my_entries[i].origins).length;
          entry_num = i;
        }
      }
    }
    // if no etym, get oldest entry
    if (etym === "") {
      for (var i = 0; i < my_entries.length; i++) {
        if (my_entries[i].year < year) {
          year = my_entries[i].year;
          entry_num = i;
        }
      }
    }

    // get origins
    var origins = [];
    var entry_origins = my_entries[entry_num].origins;
    for (var language in entry_origins) {
      var sub_arr = [];
      sub_arr.push(language);
      sub_arr.push(entry_origins[language].lat);
      sub_arr.push(entry_origins[language].lon);
      origins.push(sub_arr);
    }
    console.log("origins", origins);

    var stages = document.getElementById("stages");

    if (origins.length > 0) {

      stages.style.visibility = "visible";
    
      // populate times
      var times = [];
      var language_div = document.getElementById("languages");
      // for (var i = origins.length - 1; i >= 0; i--) {
      for (var i = 0; i < origins.length; i++) {
        var num = i + 1;
        var lang = origins[i][0];
        times.push(num + "");
        var time_el = document.createElement("span");
        time_el.id = "time" + num;
        time_el.classList.add("time");
        time_el.append(document.createTextNode(lang));
        language_div.append(time_el);
      }

      // get words
      var words = [];
      var etym_words = etym;
      for (var i = 0; i < origins.length; i++) {
        etym_words = etym_words.replace(origins[i][0], "");
      }
      words = Array.from(etym_words.matchAll(/<i>[^<]*<\/i>[^,]*/g));
      var words_div = document.getElementById("words");
      for (var i = 0; i < words.length; i++) {
        var word_el = document.createElement("span");
        word_el.id = "word" + (i + 1);
        word_el.classList.add("word");
        // word_el.append(document.createTextNode(words[i]));
        word_el.innerHTML = words[i];
        words_div.append(word_el);
      }

      // set tweens
      var settime = function(globe, t) {
        return function() {
          new TWEEN.Tween(globe).to({time: t/times.length}, 500).easing(TWEEN.Easing.Cubic.EaseOut).start();
          var time_el = document.getElementById("time" + times[t]);
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
      for (var i = 0; i < times.length; i++) {
        var time_el = document.getElementById("time" + times[i]);
        time_el.addEventListener("mouseover", settime(globe, i), false);
      }
      TWEEN.start();

      // get and parse etymology
      // split by language
      var lang_re_str = "\\s(?=";
      for (var i = 0; i < origins.length; i++) {
        lang_re_str += "" + origins[i][0] + "|";
      }
      lang_re_str = lang_re_str.slice(0, -1); // get rid of last pipe
      lang_re_str += ")";
      var lang_re = new RegExp(lang_re_str, "g");
      var split = etym.split(lang_re);
      // replace "literally."
      var literally_re = /literally,$/g;
      for (var i = split.length - 1; i >= 0; i--) {
        if (literally_re.test(split[i]) && i < split.length - 1) {
          split.splice(i, 2, split[i] + " " + split[i + 1]);
        }
      }
      // separate out connections
      var connect_re = /[,;]\s(?=from|akin to)/g;
      for (var i = split.length - 1; i >= 0; i--) {
        var subsplit = split[i].split(connect_re);
        if (subsplit.length == 2) {
          split.splice(i, 1, subsplit[0], subsplit[1]);
        }
      }
      console.log("path", split);

      // add origins
      if (origins.length > 0) {
        for (var i = 0; i < origins.length; i++) {
          var current_data = [];
          for (var j = 0; j < origins.length; j++) {
            current_data.push(origins[j][1]);
            current_data.push(origins[j][2]);
            if (i == j) { // size
              current_data.push(height_peak);
            } else {
              current_data.push(height_normal);
            }
          }
          globe.addData(current_data, {format: "magnitude", name: origins[i][0], animated: true});
        }
      }

      // create globe
      globe.createPoints();
      if (origins.length > 0) {
        settime(globe, 0)();
      }
      globe.animate();

    } else {
      stages.style.visibility = "hidden";
    }

    // mark date on timeline
    year = my_entries[entry_num].year;
    var timeline = document.getElementById("timeline");
    date_el = null;
    date_x = null;
    if (year) {
      timeline.style.visibility = "visible";
      date_x = (
        (year - timeline_start) / (timeline_end - timeline_start))
        * window.innerWidth;
      date_el = document.createElement("span");
      // date_el.append(document.createTextNode(date + ""));
      date_el.append(document.createTextNode(my_entries[entry_num].date_str));
      date_el.id = "date_marker";
      date_el.style.left = date_x + "px";
      timeline.append(date_el);
    } else {
      timeline.style.visibility = "hidden";
    }

  }
}

window.addEventListener("resize", function() {
  if (date_el && date_x) {
    date_x = (
      (year - timeline_start) / (timeline_end - timeline_start))
      * window.innerWidth;
    date_el.style.left = date_x + "px";
  }
});
