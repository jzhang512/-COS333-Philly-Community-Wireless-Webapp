// For filter sidebar. 

// Clear applied filters. IF something goes wrong, put it back to 
// document.ready call in map_global.js.
$('.filter-clear').on('click', function() {
    // Iterate through all checkboxes with class 'custom-filter-checkbox' and uncheck them
    $('.custom-filter-checkbox').prop('checked', false);

    // Do nothing if already "cleared".
    if (filterTagsId.length == 0) {
        return;
    }

    // Let users know.
    $('#are-filters-active-text').css({
        'display':'none'
    });

    filterTagsId = [];  // global!
    getSearchResults();
});

// Should have an event listener for checked filters here but located in
// map_global.js. Can't be separated from the document.ready function
// for some reason.

$('#filter-clear-span-btn').on('mouseover', function () {
    $('.filter-clear').css({
        'background-color':'#6c757d',
        'color':'#fefefe'
    });
});

$('#filter-clear-span-btn').on('mouseout', function () {
    $('.filter-clear').css({
        'background-color':'',
        'color':''
    });
});