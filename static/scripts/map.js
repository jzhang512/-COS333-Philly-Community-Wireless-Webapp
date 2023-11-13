mapboxgl.accessToken = 'pk.eyJ1IjoianY4Mjk0IiwiYSI6ImNsbzRzdjQyZjA0bDgycW51ejdtYXBteWEifQ.5epqP-7J4pRUTJAmYygM8A';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-75.1649, 39.9250],
    zoom: 11
});

let stored_hotspot = null;
let stored_reviews = null;

map.on('load', async () => {
    // Load hotspots and popup html
    const response = await fetch("/api/hotspots");
    const hotspots = await response.json();

    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);

            // call script to generate data for geojson
            features = generateFeatures(hotspots);

            // Add a GeoJSON source with 2 points
            map.addSource('points', {
                'type': 'geojson',
                'data': features
            });

            // Add a symbol layer
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'points',
                'layout': {
                    'icon-image': 'custom-marker',
                    // get the title name from the source's "title" property
                    'text-field': ['get', 'title'],
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, 1.25],
                    'text-anchor': 'top'
                }
            });
        });

    map.on('click', 'points', async (e) => {
        map.flyTo({
            center: e.features[0].geometry.coordinates
        });

        while (Math.abs(e.lngLat.lng - e.features[0].geometry.coordinates[0]) > 180) {
            e.features[0].geometry.coordinates[0] += e.lngLat.lng > e.features[0].geometry.coordinates[0] ? 360 : -360;
        }

        let id = e.features[0].properties.ID;
        let coordinates = e.features[0].geometry.coordinates;

        // Send requests to your Flask server
        const response1 = await fetch("/api/reviews?id=" + id);

        const reviews = await response1.json();

        const hotspot = getHotspot(hotspots, id);

        stored_hotspot = hotspot;
        stored_reviews = reviews;

        // call script to populate popup with information
        fillPopup(hotspot, reviews);

        $('#sidebar').modal('show');
        console.log('activated modal');
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'points', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'points', () => {
        map.getCanvas().style.cursor = '';
    });
});