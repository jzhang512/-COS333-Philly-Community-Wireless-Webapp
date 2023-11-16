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

    tags.forEach((tag) => {
        let category = tag['category'];
        let tagName = tag['tag_name'];
        let tagId = tag['tag_id'];
        $('#tagContainer' + category).append(
            $('<label class="form-check"></label>').append(
                $('<input id=tag' + tagId +' type="radio"></input>'),
                $('<span></span>').text(tagName)
            )
        );
    });
});