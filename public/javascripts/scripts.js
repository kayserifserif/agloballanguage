window.onload = function() {
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  } else {
    var container = document.getElementById("container");
    var globe = new DAT.Globe(container, {imgDir: "../images/"});
    var origins = {};
    for (var entry_num = 0; entry_num < my_entries.length; entry_num++) {
      var entry_origins = my_entries[entry_num].origins;
      for (language in entry_origins) {
        origins[language] = {
          "lat": entry_origins[language].lat,
          "lon": entry_origins[language].lon
        };
      }
    }
    console.log(my_entries[0].word, origins);
    if (origins && Object.keys(origins).length > 0) {
      var data = [];
      for (language in origins) {
        data.push(origins[language].lat);
        data.push(origins[language].lon);
        data.push(0.05); // size
      }
      globe.addData(data, {format: "magnitude", name: language});
    }
    globe.createPoints();
    globe.animate();
  }
}