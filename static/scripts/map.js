mapboxgl.accessToken = 'pk.eyJ1IjoianY4Mjk0IiwiYSI6ImNsbzRzdjQyZjA0bDgycW51ejdtYXBteWEifQ.5epqP-7J4pRUTJAmYygM8A';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-75.1649, 39.9250],
    zoom: 11
});

let active_id = null;
let hotspots;
let siteTitle = "Philly Wifi";

let filterTagsId = [];

// Empowers dynamic searching. 
function getSearchResults() {
    let query = $('#searchInput').val();

    const by_name_hotspots = hotspots.filter(item => item["name"].toLowerCase().includes(query.toLowerCase()));
    console.log(filterTagsId);

    filtered_hotspots = filterByTag(by_name_hotspots, filterTagsId);

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
    document.title = siteTitle;

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
    let queryString = window.location.search;
    let params = new URLSearchParams(queryString);
    if (params.has('hotspot_id')) {
        let hotspot_id = params.get('hotspot_id');
        console.log(hotspot_id);
        let hotspot = getHotspot(hotspot_id);
        if (hotspot != null) {
            makePopup(hotspot);
        } else {
            history.pushState(null, "", "/")
        }
    }
});

map.on('load', async () => {

    // Handle point-click on map
    map.on('click', 'circles', async (e) => {
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

    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    $('.collapse').on('hidden.bs.collapse', function () {
        map.resize();
    });

    $('.collapse').on('shown.bs.collapse', function () {
        console.log("Opened");
        console.log($('.wrapper').innerWidth() * 0.125);

        map.easeTo({
            padding: {
                left: 0,
                right: $('.wrapper').innerWidth() * 0.125,
                top: 0,
                bottom: 0
            },
            duration: 400 // In ms. This matches the CSS transition duration property.
        });
    });

    $('.collapse').on('hide.bs.collapse', function () {
        console.log("Closed");
        map.easeTo({
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            },
            duration: 400 // In ms. This matches the CSS transition duration property.
        });
    });

    // $('#sidebar-toggle').click(function () {
    //     console.log("resize!")
    //     setTimeout(function () {
    //         map.resize();
    //     }, 450);
    // });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'circles', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const title = e.features[0].properties.title;
        let id = e.features[0].id;

        popup.setLngLat(coordinates).setHTML('<p style="height: 0px"><strong>' + title + '</strong></p>').addTo(map);
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'circles', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
});