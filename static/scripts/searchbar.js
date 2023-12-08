// Update view with corresponding list/search results after search and
// or filter. Filtering should be done externally.
async function updateHotspotsList(hotspots) {
    $('#hotspotsList').empty();

    if (sort_type == "alphabetical") {
        hotspots.sort((a, b) => a['name'].localeCompare(b['name']));
    }
    else if (sort_type == "distance") {
        hotspots.sort((a, b) => a['dist'] - b['dist']);
    }
    else {
        hotspots.sort((a, b) => b['avg_rating'] - a['avg_rating']);
    }

    displayed = hotspots;

    hotspots.forEach((hotspot) => {
        var top_row = $("<span class = 'd-flex justify-content-between'>")
        var distance_button;
        if (hotspot['dist'] !== undefined) {
            distance_button = $("<span class='distance-pill'>").text(hotspot['dist'].toFixed(1)  + " mi");
        } else {
            distance_button = $("<span>");
            distance_button.append($("<i class = 'no-rating-text'>").text("Can't calculate dist."))
        }
        top_row.append(distance_button);
        // hotspot_buttonText += (hotspot['dist'] !== undefined) ? '<span class = "distance-pill">' + hotspot['dist'].toFixed(1) + ' mi</span>' : ''

        let score_button = $("<span>"); // = "<span><span class = 'avg-rating-icon'>"
        if (hotspot['avg_rating']) {
            score_button.text(parseFloat(hotspot['avg_rating']).toFixed(1)); // + "</span>";

            // Make star.
            let star = $('<span>').addClass("d-inline-block");
            let icon = document.createElement("i");
            icon.classList.add("fas", "fa-star", "star");
            star.append(icon);
            score_button.append(star.prop("outerHTML")); //+ "</span></span>";
        } else {
            score_button.append($("<i class = 'no-rating-text'>").text("No Rating"));
        }
        top_row.append(score_button);

        let buttonDiv = $('<div>');
        buttonDiv.append(top_row)
        buttonDiv.append($("<span>").text(hotspot['name']));

        let button = $('<button type="button" id=' + hotspot['hotspot_id'] + ' class="hotspots-list-button list-group-item list-group-item-action">');
        button.append(buttonDiv)
        $('#hotspotsList').append(button);
        
        // $('#hotspotsList').append(
        //     $('<button type="button" id=' + hotspot['hotspot_id'] + ' class="hotspots-list-button list-group-item list-group-item-action">')
        //     .html('<div>' + hotspot_buttonText +'</div>')
        // );
    });

    $(document).on("click",".list-group-item-action", function () {
        let id = parseInt($(this).attr('id'));
        let hotspot = getHotspot(id);
        
        makePopup(hotspot);
    });
}


// Show between which type of sort is selected by user.
function toggleSortSelection() {
    if (sort_type == "alphabetical") {
        $("#sort_alphabetical").addClass('sort-button-clicked');
        $("#sort_alphabetical").removeClass('sort-button-unclicked');

        $("#sort_distance").addClass('sort-button-unclicked');
        $("#sort_distance").removeClass('sort-button-clicked');

        $("#sort_rating").addClass('sort-button-unclicked');
        $("#sort_rating").removeClass('sort-button-clicked');

        // displayed.sort((a, b) => a['name'].localeCompare(b['name']))
        updateHotspotsList(displayed);
    }
    else if (sort_type == "distance") {
        $("#sort_alphabetical").addClass('sort-button-unclicked');
        $("#sort_alphabetical").removeClass('sort-button-clicked');

        $("#sort_distance").addClass('sort-button-clicked');
        $("#sort_distance").removeClass('sort-button-unclicked');

        $("#sort_rating").addClass('sort-button-unclicked');
        $("#sort_rating").removeClass('sort-button-clicked');

        // Nearest first.
        // displayed.sort((a, b) => a['dist'] - b['dist']);
        updateHotspotsList(displayed);
    } else {
        $("#sort_alphabetical").addClass('sort-button-unclicked');
        $("#sort_alphabetical").removeClass('sort-button-clicked');

        $("#sort_distance").addClass('sort-button-unclicked');
        $("#sort_distance").removeClass('sort-button-clicked');

        $("#sort_rating").addClass('sort-button-clicked');
        $("#sort_rating").removeClass('sort-button-unclicked');

        // Nearest first.
        // displayed.sort((a, b) => b['avg_rating'] - a['avg_rating']);
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
        lat2 = hotspots[i]['latitude'];
        lon2 = hotspots[i]['longitude'];
        // console.log(distanceBetweenPoints(lat1, lon1, lat2, lon2, false));
        hotspots[i]['dist'] = distanceBetweenPoints(lat1, lon1, lat2, lon2, false);
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
                updateHotspotsList(displayed);
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
    sort_type = "alphabetical";
    toggleSortSelection();
});

$('#sort_rating').click(function () {
    sort_type = "rating";
    toggleSortSelection();
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

        sort_type = "distance";
        toggleSortSelection();
        $('#sort_distance').removeClass('sort-button-disabled');
    }
    else {
        alert("Unable to access location. Geolocation and distance services unusable. " + 
        "Please make sure you are allowing location access. You may need to refresh the page after enabling permission.");

        // // Color like disabled button. Good compromise?
        // $('#sort_distance').addClass('sort-button-disabled');
        // $('#sort_distance').removeClass('sort-button-unclicked');
    }
});

// For smaller screen rendering (SMALLSCREENWIDTH = 992 width or less).

// Event listeners.
$('#searchInput').on('focus', function () {smallSearchRendering()});
$(window).on('resize', function() {
    // Debounce the function to avoid excessive calls during resizing
    clearTimeout($.data(this, 'resizeTimer'));
    $.data(this, 'resizeTimer', setTimeout(function() {
        // Call the function after a short delay to ensure the resizing is complete
        viewportWidthUpdates();
    }, 15));
});


// Helper functions.
function smallSearchRendering() {
    // Show the panel content when the input gains focus
    if ($(window).width() <= SMALLSCREENWIDTH) {
        // console.log('small window focus')

        display_search_panel();

        $('#close-list-text-btn, .hotspots-list-button, #toggleFilterFromSearchbar').on('click', function() {
            if ($(window).width() <= SMALLSCREENWIDTH) {
                //  console.log('small window blur')
                hide_search_panel();
             }
        });

        hide_small_filter_panel();

        // $('#close-filter-text-btn').on('click', function () {
        //     if ($(window).width() <= SMALLSCREENWIDTH) {
        //         //  console.log('small window blur')
        //         hide_small_filter_panel();
        //      }
        // });
    }
}

function display_search_panel() {
    $('#searchbar-content-div').removeClass('searchbar-content');
    $('#searchbar-content-div').addClass('searchbar-content-small');
    $('.searchbar-content-small').css({
        "display":"block",
        'position': 'absolute',
        'width': '272px',
        'height': $(window).height() * 0.7+'',
        'top': '160px',
        'left': '2.5%',
        'padding-bottom': '16px',
        'z-index': '1',/* Ensure the overlay is above the map */
        'background-color': '#E1E6F6',
        'overflow-y': 'auto',
        'overflow-x': 'auto',
        'border': '2px solid #808080',
        'border-top': 'none',
        'border-radius': '0 0 10px 10px',
    });

    //$('#searchbar-header-container').removeClass('searchbar-header');
    $('#close-list-text-btn').remove();
    $('#close-list').append('<strong id = "close-list-text-btn" >CLOSE</strong>');
}

function hide_search_panel() {
    $('#searchbar-content-div').addClass('searchbar-content');
    $('.searchbar-content-small').css({
        "display": "",
        'position': '',
        'width': '',
        'height': '',
        'top': '',
        'left': '',
        'padding-bottom': '',
        'z-index': '',
        'background-color': '',
        'overflow-y': '',
        'overflow-x': '',
        'border': '',
        'border-top': '',
        'border-radius': '',
    });

    //$('#searchbar-header-container').removeClass('searchbar-header');
    $('#searchbar-content-div').removeClass('searchbar-content-small');
    // Redundant but just in case.
    $('#close-list-text-btn').remove();
}

function display_small_filter_panel() {
    // Styling modifications/additions.
    $('.filterbar-content').css({
        "display":"block",
        'position': 'absolute',
        'width': '272px',
        'height': $(window).height() * 0.7+'',
        'top': '144.5px',
        'left': '2.5%',
        'padding-bottom': '16px',
        'z-index': '1',/* Ensure the overlay is above the map */
        'background-color': '#E1E6F6',
        'overflow-y': 'auto',
        'overflow-x': 'auto',
        'border': '2px solid #808080',
        'border-top': 'none',
        'border-radius': '0 0 10px 10px',
    });

    // A bit jank but will do since small sizes are hardwired.
    $('.small-screen-search').css({
        'border-bottom':'none',
        'border-radius': '10px 10px 0 0',
    });

    $('#filterTitleContainer').removeClass('col-9');

    // // Goes together:
    $('#filter-header-id').removeClass('row');
    $('#filterTitleContainer').addClass('row');


    $('#close-filter-text-btn').remove();

    $('#close-filter').append('<strong id = "close-filter-text-btn" >CLOSE</strong>');

    $('#close-filter-text-btn').on('click', function () {
        if ($(window).width() <= SMALLSCREENWIDTH) {
            //  console.log('small window blur')
            hide_small_filter_panel();
         }
    });
}

function hide_small_filter_panel() {
    $('.filterbar-content').css({
        'display': '',
        'position': '',
        'width': '',
        'height': '',
        'top': '',
        'left': '',
        'padding-bottom': '',
        'z-index': '',
        'background-color': '',
        'overflow-y': '',
        'overflow-x': '',
        'border': '',
        'border-top': '',
        'border-radius': '',
    });

    $('.small-screen-search').css({
        'border-bottom':'',
        'border-radius': '',
    });

    $('#filterTitleContainer').addClass('col-9');

    // // Goes together:
    $('#filter-header-id').addClass('row');
    $('#filterTitleContainer').removeClass('row');

    $('#close-filter-text-btn').remove();
}

function viewportWidthUpdates() {
    var viewportWidth = $(window).width();

    // Check if viewport width is less than 992 pixels
    if (viewportWidth <= SMALLSCREENWIDTH) {
        // Perform actions for viewport width less than 992 pixels
        if ($('#searchInput').is(':focus')) {
            smallSearchRendering();
        }

        // Remove the toggle/collapse attributes (will need to add 
        // different style for small screens).
        $('#toggleFilterFromSearchbar').removeAttr('data-bs-toggle');
        $('#toggleFilterFromSearchbar').removeAttr('data-bs-target');
        $('#toggleFilterFromSearchbar').removeAttr('aria-expanded');
        $('#toggleFilterFromSearchbar').removeAttr('aria-controls');
        $('#toggleFilterFromSearchbar').addClass('filter-render-small');
        $('#collapseFilter').removeClass('collapse');
        $('#collapseFilter').removeClass('collapse-horizontal');
        

        $('.filter-render-small').on('click', function () {
            // Needs to double check.
            if ($(this).hasClass('filter-render-small')) {
                // console.log('hi');
                display_small_filter_panel();
            }
        });
    }
    else {
        hide_search_panel();
        hide_small_filter_panel();
        $('#toggleFilterFromSearchbar').attr('data-bs-toggle', 'collapse');
        $('#toggleFilterFromSearchbar').attr('data-bs-target', '#collapseFilter');
        $('#toggleFilterFromSearchbar').attr('aria-expanded','false');
        $('#toggleFilterFromSearchbar').attr('aria-controls','collapseFilter');
        $('#toggleFilterFromSearchbar').removeAttr('aria-controls');
        $('#toggleFilterFromSearchbar').removeClass('filter-render-small');

        $('#collapseFilter').addClass('collapse');
        $('#collapseFilter').addClass('collapse-horizontal');
    }
}

