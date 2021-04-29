mapboxgl.accessToken = 'pk.eyJ1IjoidHJhbnNpcmVudCIsImEiOiJja255bXRtZGowbHF0MnBvM3U4d2J1ZG5vIn0.IVcxB9Xw6Tcc8yHGdK_0zA';
//const axios = require('axios');

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

const mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });

axios.get('/get-data')
   .then(res => {
      const offers = organizeData(res.data)

      function addMarkers() {
         offers.features.forEach(function (marker) {
            var el = document.createElement('div');
            el.id = "marker-" + marker.properties.id;
            el.className = 'marker';

            new mapboxgl.Marker(el, {
                  offset: [0, -23]
               })
               .setLngLat(marker.geometry.coordinates)
               .addTo(map);
      
            el.addEventListener('click', function (e) {
               flyToStore(marker);
               createPopUp(marker);

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

      map.on('load', function (e) {
         /* Add the data to your map as a source */
         map.addSource('places', {
            type: 'geojson',
            data: offers
         });
         addMarkers();
         buildLocationList(offers);
      });

      map.addControl(
         new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
         })
      );
   });

function organizeData(offersFromDB) {  
   const geoOffers = {
      type: 'FeatureCollection',
      features: []
   }

   offersFromDB.forEach(offer => {
      const { city, street, number, code } = offer.address;
      const address = `${street} ${number}, ${code} ${city}`;
      mapboxClient.geocoding.forwardGeocode({
         query: address,
      })
      .send()
      .then(response => {
         geoOffers.features.push({ 
            type: 'Feature',
            geometry: {
               type: 'Point',
               coordinates: response.body.features[0].center
            },
            properties: {
               id: offer._id,
               title: offer.name, 
               type: offer.type, 
               address: address,
               img: offer.imgPath
            }
         })
      });
   })
   return geoOffers
}

const map = new mapboxgl.Map({
   container: 'map',
   style: 'mapbox://styles/mapbox/streets-v11',
   center: [13.405, 52.52], // starting position [lng, lat]
   doubleClickZoom: true,
   zoom: 9,
});

function buildLocationList(data) {
   data.features.forEach(function (geoOffers, i) {

      var prop = geoOffers.properties;

      var listings = document.getElementById('listings');
      var listing = listings.appendChild(document.createElement('div'));

      listing.id = "listing-" + data.features[i].properties.id;
      listing.className = 'item';

      /* Add the link to the individual listing created above. */
      var link = listing.appendChild(document.createElement('a'));
      link.href = '#map-container';
      link.className = 'title';
      link.id = "link-" + prop.id;
      link.innerHTML = prop.title;

      /* Add details to the individual listing. */
      var details = listing.appendChild(document.createElement('div'));
      details.innerHTML = `<h4 class="address">${prop.address}</h4>
                           <p class="list-type">${prop.type}</p>`;

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
      zoom: 12
   });
}

//displays a Mapbox GL JS Popup at that same store location.
function createPopUp(currentFeature) {
   var popUps = document.getElementsByClassName('mapboxgl-popup');

   if (popUps[0]) popUps[0].remove();

   var popup = new mapboxgl.Popup({
         closeOnClick: true
      })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(`<img src="${currentFeature.properties.img}" alt="${currentFeature.properties.title} image" onerror="this.style.display='none'">
                <h3>${currentFeature.properties.title}</h3>
                <h4 class="address">${currentFeature.properties.address}</h4>
                <h4 class="type">${currentFeature.properties.type}</h4>
                <a href="/offers/${currentFeature.properties.id}">View</a>`)
      .addTo(map);
}
