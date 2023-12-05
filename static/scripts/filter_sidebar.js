// For filter sidebar. 

// Update view with corresponding list/search results after search and
// or filter. Filtering should be done externally.
function updateHotspotsList(hotspots) {
    $('#hotspotsList').empty();
    displayed = hotspots;

    hotspots.forEach((hotspot) => {
        $('#hotspotsList').append(
            $('<button type="button" id=' + hotspot['hotspot_id'] + ' class="list-group-item list-group-item-action"></button>')
            .text(hotspot['name'])
            //$('<li class="list-group-item"></li>').text(hotspot['name'])
        );
    });

    $(document).on("click",".list-group-item-action", function () {
        let id = parseInt($(this).attr('id'));
        let hotspot = getHotspot(id);
        
        makePopup(hotspot);
    });
}

// Clear applied filters.
$('.filter-clear').on('click', function() {
    // Iterate through all checkboxes with class 'custom-filter-checkbox' and uncheck them
    $('.custom-filter-checkbox').prop('checked', false);

    if (filterTagsId.length == 0) {
        return;
    }

    filterTagsId = [];  // global!
    getSearchResults();
});