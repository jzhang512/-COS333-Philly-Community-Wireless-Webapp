// Show between which type of sort is selected by user.
function toggleSortSelection(alph_selected) {
    if (alph_selected) {
        $("#sort_alphabetical").addClass('sort-button-clicked');
        $("#sort_alphabetical").removeClass('sort-button-unclicked');

        $("#sort_distance").addClass('sort-button-unclicked');
        $("#sort_distance").removeClass('sort-button-clicked');

        displayed.sort((a, b) => a['name'].localeCompare(b['name']))
        updateHotspotsList(displayed);
    }
    else {
        $("#sort_alphabetical").addClass('sort-button-unclicked');
        $("#sort_alphabetical").removeClass('sort-button-clicked');

        $("#sort_distance").addClass('sort-button-clicked');
        $("#sort_distance").removeClass('sort-button-unclicked');

        displayed.sort((a, b) => b['dist'] - a['dist']);
        updateHotspotsList(displayed);
    }
}

// Calculate distances between two points given their latitude and 
// longitude. Returns metric or US system.
function distanceBetweenPoints(lat1, lon1, lat2, lon2, metric) {

    var R = (metric) ? 6371 : 3958.8; // Radius of the earth 
    var dLat = degreeToRad(lat2 - lat1);
    var dLon = degreeToRad(lon2 - lon1);

    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degreeToRad(lat1)) * Math.cos(degreeToRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = R * c;
    return distance;
}

// Helper for distance.
function degreeToRad(deg) {
    return deg * (Math.PI / 180)
}

function updateDistances(coords) {
    let lon1 = coords[0];
    let lat1 = coords[1];
    for (i = 0; i < hotspots.length; i++) {
        lon2 = hotspots[i]['latitude'];
        lat2 = hotspots[i]['longitude'];
        hotspots[i]['dist'] = distanceBetweenPoints(lat1, lon1, lat2, lon2);
    }
}

// Get user's geolocation, if they allow it. Pass callback to ensure 
// some styling is properly followed (no function default).
function getLocation(callback = () => { }) {
    if (navigator.geolocation) {
        console.log("Geolocation supported");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                callback(); // remove "lock"
                $('#sort_distance').removeClass('sort-button-disabled');
                $('#sort_distance').addClass('sort-button-unclicked');
                console.log("Current position:", position);

                // user_coords is global.
                user_coords = [position['coords']['longitude'], position['coords']['latitude']];
                updateDistances(user_coords);
            },
            (error) => {
                callback(); // remove "lock"
                $('#sort_distance').removeClass('sort-button-unclicked');
                $('#sort_distance').addClass('sort-button-disabled');
                console.error("Error getting position:", error);
                user_coords = null;
            }
        );
    }
    else {
        callback(); // remove "lock"
        $('#sort_distance').removeClass('sort-button-unclicked');
        $('#sort_distance').addClass('sort-button-disabled');
        console.log("Geolocation not supported");
        user_coords = null;
    }
}

$('#sort_alphabetical').click(function () {
    toggleSortSelection(true);
});

$('#sort_distance').click(function () {
    getLocation();
    // console.log(success);

    if (user_coords != null) {
        map.flyTo({
            center: user_coords,
            zoom: 15
        });

        map.setLayoutProperty(
            'user-location-pulse',
            'visibility',
            'visible'
        );

        const user_dot = map.getSource('dot-point');
        // Update the data after the GeoJSON source was created
        user_dot.setData({
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': user_coords // icon position [lng, lat]
                    }
                }
            ]
        });

        console.log('set data');

        toggleSortSelection(false);
        $('#sort_distance').removeClass('sort-button-disabled');
    }
    else {
        alert("Unable to access location. Geolocation and distance services unusable. Please make sure you are allowing location access.");

        // // Color like disabled button. Good compromise?
        // $('#sort_distance').addClass('sort-button-disabled');
        // $('#sort_distance').removeClass('sort-button-unclicked');
    }
});

