mapboxgl.accessToken = 'pk.eyJ1IjoidHJhbnNpcmVudCIsImEiOiJja255bXRtZGowbHF0MnBvM3U4d2J1ZG5vIn0.IVcxB9Xw6Tcc8yHGdK_0zA';
var map = new mapboxgl.Map({
   container: 'map',
   style: 'mapbox://styles/mapbox/streets-v11',
   center: [13.405, 52.52], // starting position [lng, lat]
   doubleClickZoom: true,
   zoom: 9, // starting zoom
   // pitch: 100
});