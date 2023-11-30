let tags;

// For filter sidebar. 

// Update view with corresponding list/search results after search and
// or filter. Filtering should be done externally.
function updateHotspotsList(hotspots) {
    $('#hotspotsList').empty();

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

$(document).ready(async function() {
    const response = await fetch("/api/tags");
    tags = await response.json();

    if (tags == "Database Error") {
        tags = [];
        alert("Database error fetching tags");
    }

    tags.sort((a, b) => a['tag_name'].localeCompare(b['tag_name']))
    console.log

    // $("#sidebarToggle").click(function() {
    //     console.log("toggled")
    //     $("#leftSidebar").toggleClass("left-sidebar-active");
    //     // $("#map").toggleClass("active-sidebar-map");
    //     // $("#nav-bar").toggleClass("navbar-active-sidebar")
    // });

     $('#apply-filter').click(function() {
        // Find the ID of the checked radio button
        let tagArray = []

        if ($('input[name="btnCost"]:checked').attr('id'))
            tagArray.push(parseInt($('input[name="btnCost"]:checked').attr('id')));
        if ($('input[name="btnEstablishment"]:checked').attr('id'))
            tagArray.push(parseInt($('input[name="btnEstablishment"]:checked').attr('id')));
        if ($('input[name="btnAccessibility"]:checked').attr('id'))
            tagArray.push(parseInt($('input[name="btnAccessibility"]:checked').attr('id')));
        if ($('input[name="btnPassword"]:checked').attr('id'))    
            tagArray.push(parseInt($('input[name="btnPassword"]:checked').attr('id')));

        console.log('Selected Radio Button ID:', tagArray);

        hotspotsFiltered = filterByTag(hotspots, tagArray);
        features = generateFeatures(hotspotsFiltered);
        addLayer(features, remove=true);
        updateHotspotsList(hotspotsFiltered);
    });

    $('#clear-filter').click(function() {
        console.log('Clear filter');
        $('input[name="btnCost"]').prop('checked', false);
        $('input[name="btnEstablishment"]').prop('checked', false);
        $('input[name="btnAccessibility"]').prop('checked', false);
        $('input[name="btnPassword"]').prop('checked', false);

        features = generateFeatures(hotspots);
        addLayer(features, remove=true);
        updateHotspotsList(hotspots);
    })

    categories = [];
    tags.forEach((tag) => {
        let category = tag['category'];
        if (!categories.includes(category)) {
            categories.push(category);
        }
    });

    categories.sort();
    categories.forEach((cat) => {
        $('#filterView').append($('<h6 id=\"' + cat + 'tag\" class = \"tagHeader\">' + cat + '<br></h6>'),
            $('<div class=\"form-check filter-form\" id = \"form' + cat + '\"></div>')
        );
    });

    tags.forEach((tag) => {
        let category = tag['category'];
        let tagName = tag['tag_name'];
        let tagId = tag['tag_id'];
        $('#form' + category).append($('<div class=""></div>').append(
            $('<input class=\"form-check-input custom-filter-checkbox\" type=\"checkbox\" value=\"\" id=\"check' + tagId + '\">'),
            $('<label class=\"form-check-label col-12\" for=\"check' + tagId + '\">'+
              tagName +
            '</label>'), $('<br>'))

            // OLD attempt with button-like checkboxes.
            // $('<input type=\"checkbox\" class=\"btn-check\" id=\"btn-check' + tagId + '\" autocomplete=\"off\">'+
            // '<label class=\"btn btn-outline-secondary col-12\" for=\"btn-check' + tagId + '\">' + tagName + '</label><br>')
            // $('<button type=\"button\" class=\"btn btn-outline-warning\">Warning</button><br>')
        );
    }
    );

     // Attach a change event listener to all checkboxes with class 'checkbox-group'
     $('.custom-filter-checkbox').on('change', function() {
        
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

    // tags.forEach((tag) => {
    //     let category = tag['category'];
    //     let tagName = tag['tag_name'];
    //     let tagId = tag['tag_id'];
    //     $('#' + category + "tag").append(
    //         $('<label class="form-check form-check-inline"></label>').append(
    //             $('<input name=btn' + category + ' id=' + tagId +' type="radio" ></input>'),
    //             $('<span> </span>').text(tagName)
    //         )
    //     );
    // });
});