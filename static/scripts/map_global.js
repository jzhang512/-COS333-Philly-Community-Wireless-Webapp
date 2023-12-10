mapboxgl.accessToken = 'pk.eyJ1IjoianY4Mjk0IiwiYSI6ImNsbzRzdjQyZjA0bDgycW51ejdtYXBteWEifQ.5epqP-7J4pRUTJAmYygM8A';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-75.1649, 39.9250],
    zoom: 11
});

// All global variables for application's map side.
//---------------------------------------------------------------------
let active_id = null;
let tags;
let hotspots;
let displayed;
let siteTitle = "Find Philly Wi-Fi";
let sort_type = "alphabetical";
let SMALLSCREENWIDTH = 1150;

// User coordinates stored as [lon., lat.], null if not available
let user_coords = null;
let filterTagsId = [];

//---------------------------------------------------------------------

// Empowers dynamic searching. 
function getSearchResults() {
    let query = $('#searchInput').val();

    const by_name = hotspots.filter(item => item["name"].toLowerCase().includes(query.toLowerCase()));
    const by_addr = hotspots.filter(item => item["address"].toLowerCase().includes(query.toLowerCase()));
    const by_tag = hotspots.filter(item => {
        let bool = false;
        item["tags"].forEach(tag => {
            if (tag["tag_name"].toLowerCase().includes(query.toLowerCase()))
                bool = true;
        })
        return bool;
    })
    let combined_search = union(by_name, by_addr);
    combined_search = union(combined_search, by_tag);

    filtered_hotspots = filterByTag(combined_search, filterTagsId);

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
    viewportWidthUpdates(); // from searchbar.js
}

// -------------------------------------------------------------------

// Should be the only document.ready call for map side.
$(document).ready(async () => {

    // The initial setup.
    document.title = siteTitle;

    const response = await fetch("/api/hotspots?ratings='True'");
    hotspots = await response.json();

    if (hotspots == "Database Error") {
        hotspots = [];
        alert("Database error fetching hotspots");
    }

    for (let i = 0; i < hotspots.length; i++) {
        avg = average(hotspots[i]['ratings']);
        hotspots[i]['avg_rating'] = avg;
    }

    hotspots.sort((a, b) => a['name'].localeCompare(b['name']))

    // Get initial location
    getLocation(function () {
        // Styling. Must occur after we know that we can access user's
        // location.
        $('#sort_distance').removeAttr('disabled', 'disabled');
        $('#sort_distance').addClass('btn-secondary');
        console.log(user_coords);
    });

    // call script to generate data for geojson
    features = generateFeatures(hotspots);
    addLayer(features);

    updateHotspotsList(hotspots);

    setup();

    let queryString = window.location.search;
    let params = new URLSearchParams(queryString);
    if (params.has('hotspot_id')) {
        let hotspot_id = params.get('hotspot_id');
        let hotspot = getHotspot(hotspots, hotspot_id);
        if (hotspot != null) {
            makePopup(hotspot);
        } else {
            history.pushState(null, "", "/")
        }
    }

    // FILTERBAR CODE ----------------------------------------------
    // -----------------------------------------------------------

    const tag_response = await fetch("/api/tags");
    tags = await tag_response.json();

    if (tags == "Database Error") {
        tags = [];
        alert("Database error fetching tags");
    }

    tags.sort((a, b) => a['tag_name'].localeCompare(b['tag_name']))

    categories = [];
    tags.forEach((tag) => {
        let category = tag['category'];
        if (!categories.includes(category)) {
            categories.push(category);
        }
    });

    categories.sort();
    categories.forEach((cat) => {
        $('#filters-list').append($('<h6 id=\"' + cat + 'tag\" class = \"tagHeader\">' + cat + '<br></h6>'),
            $('<div class=\"form-check filter-form\" id = \"form' + cat + '\"></div>')
        );
    });

    tags.forEach((tag) => {
        let category = tag['category'];
        let tagName = tag['tag_name'];
        let tagId = tag['tag_id'];
        $('#form' + category).append($('<div class=""></div>').append(
            $('<input class=\"form-check-input custom-filter-checkbox\" type=\"checkbox\" value=\"\" id=\"check' + tagId + '\">'),
            $('<label class=\"form-check-label\" for=\"check' + tagId + '\">' +
                tagName +
                '</label>'), $('<br>'))
        );
    }
    );

    // Attach a change event listener to all checkboxes with class 'checkbox-group'.
    // Can't move outside of document.ready for some reason.
    $('.custom-filter-checkbox').on('change', function () {

        if ($(this).is(':checked')) {
            console.log('Checkbox with ID ' + this.id + ' is checked!');
            // Perform actions when checkbox is checked
            filterTagsId.push(parseInt(this.id.slice(5)));   // filterTags is global!
        }
        else {
            console.log('Checkbox with ID ' + this.id + ' is unchecked!');
            // Perform actions when checkbox is unchecked. Removes from
            // list of tags to filter.
            const index = filterTagsId.indexOf(parseInt(this.id.slice(5)));
            if (index > -1) { // only splice array when item is found
                // 2nd parameter means remove one item only. Trivial
                filterTagsId.splice(index, 1);
            }
        }

        getSearchResults();
    });

    // // Small screen rendering.
    // $('.filter-render-small').on('click', function () {
    //     // Needs to double check.
    //     if ($(this).hasClass('filter-render-small')) {
    //         console.log('hi');
    //         display_filter_panel();
    //     }
    // });
});

const size = 200;

// This implements `StyleImageInterface`
// to draw a pulsing dot icon on the map.
const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // When the layer is added to the map,
    // get the rendering context for the map canvas.
    onAdd: function () {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },

    // Call once before every frame where the icon will be used.
    render: function () {
        const duration = 1000;
        const t = (performance.now() % duration) / duration;

        const radius = (size / 2) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;

        // Draw the outer circle.
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = `rgba(30, 161, 161, ${1 - t})`;
        context.fill();

        // Draw the inner circle.
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(30, 161, 161, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // Update this image's data with data from the canvas.
        this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
        ).data;

        // Continuously repaint the map, resulting
        // in the smooth animation of the dot.
        map.triggerRepaint();

        // Return `true` to let the map know that the image was updated.
        return true;
    }
};


map.on('load', async () => {

    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    map.addSource('dot-point', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [-75.2, 40] // icon position [lng, lat]
                    }
                }
            ]
        }
    });

    map.addLayer({
        'id': 'user-location-pulse',
        'type': 'symbol',
        'source': 'dot-point',
        'layout': {
            'icon-image': 'pulsing-dot',
            'visibility': 'none'
        }
    });

    // Handle point-click on map (when user clicks on a certain hotspot).
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

        const hotspot = getHotspot(hotspots, id);
        makePopup(hotspot);

        // For smaller screens.
        if ($(window).width() <= SMALLSCREENWIDTH) {
            hide_search_panel();
            hide_small_filter_panel();
         }
    });

    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    $('.filterbar-panel').on('hidden.bs.collapse', function () {
        map.resize();
    });

    $('.filterbar-panel').on('shown.bs.collapse', function () {

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

    $('.filterbar-panel').on('hide.bs.collapse', function () {
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