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


$(document).ready(async function() {

    $('#sort_alphabetical').click(function() {
        toggleSortSelection(true);
    });
    $('#sort_distance').click(function() {
        toggleSortSelection(false);
    });
});