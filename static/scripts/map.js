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
    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);
        });

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

    $('#sidebar-toggle').click(function () {
        console.log("resize!")
        setTimeout(function () {
            map.resize();
        }, 450);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'circles', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const title = e.features[0].properties.title;
        popup.setLngLat(coordinates).setHTML('<p style="height: 0px"><strong>' + title + '</strong></p>').addTo(map);
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'circles', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
});