mapboxgl.accessToken = 'pk.eyJ1IjoianY4Mjk0IiwiYSI6ImNsbzRzdjQyZjA0bDgycW51ejdtYXBteWEifQ.5epqP-7J4pRUTJAmYygM8A';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-75.1649, 39.9250],
    zoom: 11
});

map.on('load', async () => {
    // Add an image to use as a custom marker
    const response = await fetch("/api/hotspots");
    const hotspots = await response.json();
    features = generateFeatures(hotspots);

    const response2 = await fetch("/api/popup");
    const popupHTML = await response2.text();

    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);

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
        let coordinates = e.features[0].geometry.coordinates
        
        // Send requests to your Flask server
        const response1 = await fetch("/api/reviews?id=" + id);
        const reviews = await response1.json();

        var popup = new mapboxgl.Popup({ offset: 25 })
            .setLngLat(coordinates)
            .setHTML(popupHTML)
            .addTo(map);
            
        const hotspot = getHotspot(hotspots, id);
        
        fillPopup(hotspot, reviews);
    });
});