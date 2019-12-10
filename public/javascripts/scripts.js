window.onload = function() {
  var container = document.getElementById("container");
  var globe = new DAT.Globe(container);
  console.log(globe);
  globe.createPoints();
  globe.animate();
}