$(document).ready(async function() {
    const response = await fetch("/api/tags");
    const tags = await response.json();

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

        tagArray.push($('input[name="btnCost"]:checked').attr('id'));
        tagArray.push($('input[name="btnEstablishment"]:checked').attr('id'));
        tagArray.push($('input[name="btnAccessibility"]:checked').attr('id'));
        tagArray.push($('input[name="btnPassword"]:checked').attr('id'));

        console.log('Selected Radio Button ID:', tagArray);

        generateFeatures(hotspots, tagArray)
    });

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