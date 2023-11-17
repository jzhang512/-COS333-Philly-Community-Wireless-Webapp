let tags;

$(document).ready(async function() {
    const response = await fetch("/api/tags");
    tags = await response.json();

    tags.sort((a, b) => a['tag_name'].localeCompare(b['tag_name']))
    console.log

    let categories = ['Cost', 'Privacy', 'Password', 'Amenities', 
                      'Establishment', 'Accessibility']

    $("#sidebarToggle").click(function() {
        console.log("toggled")
        $("#leftSidebar").toggleClass("left-sidebar-active");
        $("#map").toggleClass("active-sidebar-map");
        $("#nav-bar").toggleClass("navbar-active-sidebar")
    });

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

        features = generateFeatures(hotspots, tagArray);
        addLayer(features, remove=true);
    });

    $('#clear-filter').click(function() {
        console.log('Clear filter');
        $('input[name="btnCost"]').prop('checked', false);
        $('input[name="btnEstablishment"]').prop('checked', false);
        $('input[name="btnAccessibility"]').prop('checked', false);
        $('input[name="btnPassword"]').prop('checked', false);
        features = generateFeatures(hotspots);
        addLayer(features, remove=true);
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