// For filter sidebar. 

// Clear applied filters. IF something goes wrong, put it back to 
// document.ready call in map_global.js.
$('.filter-clear').on('click', function() {
    // Iterate through all checkboxes with class 'custom-filter-checkbox' and uncheck them
    $('.custom-filter-checkbox').prop('checked', false);

    if (filterTagsId.length == 0) {
        return;
    }

    filterTagsId = [];  // global!
    getSearchResults();
});

// Should have an event listener for checked filters here but located in
// map_global.js. Can't be separated from the document.ready function
// for some reason.