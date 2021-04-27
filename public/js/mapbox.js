mapboxgl.accessToken = 'pk.eyJ1IjoidHJhbnNpcmVudCIsImEiOiJja255bXRtZGowbHF0MnBvM3U4d2J1ZG5vIn0.IVcxB9Xw6Tcc8yHGdK_0zA';
//const axios = require('axios');

axios.get('http://localhost:3000/get-data')
   .then(res => {
      organizeData(res.data)
      //map(res.data);
   });

function organizeData(offersFromDB) {  
   const geoOffers = {
      type: 'FeatureCollection',
      features: []
   }

   offersFromDB.forEach(offer => {
      const { city, street, number, code } = offer.address;
      const address = `${street} ${number}, ${code} ${city}`;
      geoOffers.features.push({ 
         type: 'Feature',
         geometry: {
            type: 'Point',
            //coordinates: [coordinates from database or using geocoder]
         },
         properties: {
            name: offer.name, 
            type: offer.type, 
            address: address
         }
      })
   })
   console.log('this is the organized data', geoOffers)
   return geoOffers
}

const map = new mapboxgl.Map({
   container: 'map',
   style: 'mapbox://styles/mapbox/streets-v11',
   center: [13.405, 52.52], // starting position [lng, lat]
   doubleClickZoom: true,
   zoom: 9,
});

//offers model used for testing. 
const stores = {
   type: 'FeatureCollection',
   features: [{
      type: 'Feature',
      geometry: {
         type: 'Point',
         coordinates: [13.405, 52.52]
      },
      properties: {
         title: 'Room 1',
         description: 'Apartment',
         type: "Room",
         address: 'carrer font vella'
      }
   },
   {
      type: 'Feature',
      geometry: {
         type: 'Point',
         coordinates: [13.425, 52.52]
      },
      properties: {
         title: 'Room 2',
         description: 'Room',
         type: "Appartment",
         address: 'carrer Sant gaieta'
      }
   }]
};


/* Assign a unique ID to each store */
stores.features.forEach(function (store, i) {
   store.properties.id = i;
});

map.on('load', function (e) {
   /* Add the data to your map as a source */
   map.addSource('places', {
      type: 'geojson',
      data: stores
   });
   addMarkers();
   //creates function to iterate through the locations and add each one to the sidebar listing
   buildLocationList(stores);
});


function addMarkers() {
   /* For each feature in the GeoJSON object above: */
   stores.features.forEach(function (marker) {
      /* Create a div element for the marker. */
      var el = document.createElement('div');
      /* Assign a unique `id` to the marker. */
      el.id = "marker-" + marker.properties.id;
      /* Assign the `marker` class to each marker for styling. */
      el.className = 'marker';

      /**
       * Create a marker using the div element
       * defined above and add it to the map.
       **/
      new mapboxgl.Marker(el, {
            offset: [0, -23]
         })
         .setLngLat(marker.geometry.coordinates)
         .addTo(map);

      el.addEventListener('click', function (e) {
         /* Fly to the point */
         flyToStore(marker);
         /* Close all other popups and display popup for clicked store */
         createPopUp(marker);
         /* Highlight listing in sidebar */
         var activeItem = document.getElementsByClassName('active');
         e.stopPropagation();
         if (activeItem[0]) {
            activeItem[0].classList.remove('active');
         }
         var listing = document.getElementById('listing-' + marker.properties.id);
         listing.classList.add('active');
      });
   });
}


function buildLocationList(data) {
   data.features.forEach(function (store, i) {
      /**
       * Create a shortcut for `store.properties`,
       * which will be used several times below.
       **/
      var prop = store.properties;

      /* Add a new listing section to the sidebar. */
      var listings = document.getElementById('listings');
      var listing = listings.appendChild(document.createElement('div'));
      /* Assign a unique `id` to the listing. */
      listing.id = "listing-" + data.features[i].properties.id;
      /* Assign the `item` class to each listing for styling. */
      listing.className = 'item';

      /* Add the link to the individual listing created above. */
      var link = listing.appendChild(document.createElement('a'));
      link.href = '#';
      link.className = 'title';
      link.id = "link-" + prop.id;
      link.innerHTML = prop.title;

      /* Add details to the individual listing. */
      var details = listing.appendChild(document.createElement('div'));
      details.innerHTML = `<div>${prop.type}</div><div>${prop.address}</div>`;

      //add event listener when user clicks on the list
      link.addEventListener('click', function (e) {
         for (var i = 0; i < data.features.length; i++) {
            if (this.id === "link-" + data.features[i].properties.id) {
               var clickedListing = data.features[i];
               flyToStore(clickedListing);
               createPopUp(clickedListing);
            }
         }
         var activeItem = document.getElementsByClassName('active');
         if (activeItem[0]) {
            activeItem[0].classList.remove('active');
         }
         this.parentNode.classList.add('active');
      });
   });
}


//center the map on the correct store location and zoom in.
function flyToStore(currentFeature) {
   map.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 15
   });
}

//displays a Mapbox GL JS Popup at that same store location.
function createPopUp(currentFeature) {
   var popUps = document.getElementsByClassName('mapboxgl-popup');
   /** Check if there is already a popup on the map and if so, remove it */
   if (popUps[0]) popUps[0].remove();

   console.log('current feature', currentFeature)

   var popup = new mapboxgl.Popup({
         closeOnClick: false
      })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(`<h3>${currentFeature.properties.title}</h3>
                <h4>${currentFeature.properties.type}</h4>
                <h4>${currentFeature.properties.address}</h4>`)
      .addTo(map);
}

// Add the control to the map.
map.addControl(
   new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
   })
);