// Show between which type of sort is selected by user.
function toggleSortSelection(alph_selected) {
    if (alph_selected) {
        $("#sort_alphabetical").addClass('sort-button-clicked');
        $("#sort_alphabetical").removeClass('sort-button-unclicked');

        $("#sort_distance").addClass('sort-button-unclicked');
        $("#sort_distance").removeClass('sort-button-clicked');
    }
    else {
        $("#sort_alphabetical").addClass('sort-button-unclicked');
        $("#sort_alphabetical").removeClass('sort-button-clicked');

        $("#sort_distance").addClass('sort-button-clicked');
        $("#sort_distance").removeClass('sort-button-unclicked');
    }
}

// Calculate distances between two points given their latitude and 
// longitude. Returns metric or US system.
function distanceBetweenPoints(lat1, lon1, lat2, lon2, metric) {

    var R = (metric) ? 6371 : 3958.8; // Radius of the earth 
    var dLat = degreeToRad(lat2-lat1);
    var dLon = degreeToRad(lon2-lon1); 

    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var distance = R * c;
    return distance;
}

// Helper for distance.
function degreeToRad(deg) {
    return deg * (Math.PI/180)
}

// Get user's geolocation, if they allow it.
function getLocation() {
    if (navigator.geolocation) {
        console.log("Geolocation supported");
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Current position:", position);
                return true;
            },
            (error) => {
                console.error("Error getting position:", error);
                return false;
            }
        );
    } 
    else {
        console.log("Geolocation not supported");
        return false;
    }
}


$(document).ready(async function() {

    let location_intially_shared = getLocation();

    if (location_intially_shared == undefined) {
        $('#sort_distance').addClass('sort-button-disabled');
    }
    else {
        $('#sort_distance').addClass('sort-button-unclicked');
    }

    $('#sort_alphabetical').click(function() {
        toggleSortSelection(true);
    });

    $('#sort_distance').click(function() {
        let success = getLocation();
        // console.log(success);

        if (success == undefined) {
            alert("Unable to access location. Geolocation and distance services unusable. Please make sure you are allowing location access.");

            // Color like disabled button. Good compromise?
            $('#sort_distance').addClass('sort-button-disabled');
            $('#sort_distance').removeClass('sort-button-unclicked');

            // Should we disable button?
            // $('#sort_distance').attr("disabled", "disabled");
            // $('#sort-searchbar-row2').after("<i id='enable-location-text'>Enable location access.</i>");
        }
        else {  // Must have access to location for this feature.
            toggleSortSelection(false);

            $('#sort_distance').removeClass('sort-button-disabled');
        }
    });
});
