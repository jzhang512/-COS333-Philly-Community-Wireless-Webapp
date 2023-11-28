let tags;

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

    let categories = ['Cost', 'Privacy', 'Password', 'Amenities', 
                      'Establishment', 'Accessibility']

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

    tags.forEach((tag) => {
        let category = tag['category'];
        let tagName = tag['tag_name'];
        let tagId = tag['tag_id'];
        $('#tagContainer' + category).append(
            $('<label class="form-check form-check-inline"></label>').append(
                $('<input name=btn' + category + ' id=' + tagId +' type="radio" ></input>'),
                $('<span> </span>').text(tagName)
            )
        );
    });
});