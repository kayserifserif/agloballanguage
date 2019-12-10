window.onload = function() {
  var container = document.getElementById("container");
  var globe = new DAT.Globe(container);
  var origins = null;
  var entry_num = 0;
  while (!origins && entry_num < my_entries.length) {
    origins = my_entries[entry_num].origins;
    entry_num++;
  }
  console.log(my_entries[0].word, origins);
  if (origins && Object.keys(origins).length > 0) {
    var data = [];
    for (language in origins) {
      data.push(origins[language].lat);
      data.push(origins[language].lon);
      data.push(0.05);
    }
    globe.addData(data, {});
  }
  globe.createPoints();
  globe.animate();
}