mapboxgl.accessToken = 'pk.eyJ1IjoianY4Mjk0IiwiYSI6ImNsbzRzdjQyZjA0bDgycW51ejdtYXBteWEifQ.5epqP-7J4pRUTJAmYygM8A';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-75.1649, 39.9250],
    zoom: 11
});

let active_id = null;
let hotspots;

// Empowers dynamic searching. 
function getSearchResults() {
    let query = $('#searchInput').val();

    const filtered_hotspots = hotspots.filter(item => item["name"].toLowerCase().includes(query.toLowerCase()));

    // Updates the map hotspots accordingly.
    features = generateFeatures(filtered_hotspots);
    addLayer(features, remove = true);
    updateHotspotsList(filtered_hotspots);
}

let search_check_timer = null;

function debouncedGetResults() {
    clearTimeout(search_check_timer);
    search_check_timer = setTimeout(getSearchResults, 500);
}

function setup() {
    getSearchResults();
    $('#searchInput').on('input', debouncedGetResults);
}

$(document).ready(async () => {
    const response = await fetch("/api/hotspots");
    hotspots = await response.json();

    if (hotspots == "Database Error") {
        hotspots = [];
        alert("Database error fetching hotspots");
    }

    hotspots.sort((a, b) => a['name'].localeCompare(b['name']))

    // call script to generate data for geojson
    features = generateFeatures(hotspots);
    addLayer(features);

    updateHotspotsList(hotspots);

    setup();
});

map.on('load', async () => {
    // Load hotspots and popup html
    // const response = await fetch("/api/hotspots");
    // hotspots = await response.json();

    // if (hotspots == "Database Error") {
    //     hotspots = [];
    //     alert("Database Error");
    // }

    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);
        });

    // Handle point-click on map
    map.on('click', 'points', async (e) => {
        map.flyTo({
            center: e.features[0].geometry.coordinates
        });

        while (Math.abs(e.lngLat.lng - e.features[0].geometry.coordinates[0]) > 180) {
            e.features[0].geometry.coordinates[0] += e.lngLat.lng > e.features[0].geometry.coordinates[0] ? 360 : -360;
        }

        let id = e.features[0].properties.ID;
        active_id = id;

        // let coordinates = e.features[0].geometry.coordinates;

        const hotspot = getHotspot(id);
        makePopup(hotspot);
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