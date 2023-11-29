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
        $('#filterView').append($('<h6 id=\"' + cat + 'tag\" class = \"tagHeader\">' + cat + '<br></h6>'));
    });

    tags.forEach((tag) => {
        let category = tag['category'];
        let tagName = tag['tag_name'];
        let tagId = tag['tag_id'];
        $('#' + category + "tag").append(
            $('<input type=\"checkbox\" class=\"btn-check\" id=\"btn-check' + tagId + '\" autocomplete=\"off\">'+
            '<label class=\"btn btn-outline-secondary col-12\" for=\"btn-check' + tagId + '\">' + tagName + '</label></br>')
        //    $('<br><input type=\"checkbox\" class=\"btn-check tag\" id=\"btn-check' + tagId + '\" autocomplete=\"off\">'+
        //    '<br><label class=\"btn btn-outline-secondary\" for=\"btn-check' + tagId + '\">' + tagName + '</label>')
        );
    }
    );

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