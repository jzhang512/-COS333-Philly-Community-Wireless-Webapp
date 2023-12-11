// $('#new-hotspot').click(createNewHotspot);

function setupMap() {
    history.pushState(null, "Update Map", "/admin/update");
    console.log("pushed");
    document.title = siteTitle + " - Update Hotspots";

    let requestData = {
        type: 'GET',
        async: false,
        url: "/api/hotspots",
        success: function (data) {
            hotspots = data;
            hotspots.sort((a, b) => a['name'].localeCompare(b['name']))
            setup();
        }
    };

    let tagRequestData = {
        type: 'GET',
        async: false,
        url: "/api/tags",
        success: function (data) {
            tags = data;
        }
    };

    $.ajax(tagRequestData);
    $.ajax(requestData);
}

function setup() {
    $("#results-div").empty();
    $('body').addClass('vh-100 mh-100 overflow-hidden');
    $('#results-div').addClass('d-flex flex-column vh-100 mh-100 overflow-hidden');
    $('<h2/>').addClass("row mx-2 mt-4 flex-shrink-1").text("Update/Add/Remove Hotspots").appendTo('#results-div');
    let mainGrid = $('<div/>').addClass("row flex-grow-1 mt-3 mb-2 overflow-hidden").appendTo('#results-div');
    let leftCol = $('<div/>').addClass("d-flex flex-column col-4 mh-100 overflow-hidden").appendTo(mainGrid);

    // let tabCol = $('<div/>').addClass("border-end pb-3 overflow-auto").appendTo(leftCol);
    let paneCol = $('<div/>').addClass("col-8 mh-100 px-3 bottom-buffer overflow-auto").appendTo(mainGrid);

    let searchDiv = $('<div/>').appendTo(leftCol);

    let search = $('<h5>').appendTo(searchDiv);
    search.text('Search');

    let searchBox = $('<input type="text" class="form-control search-box" id="search">').appendTo(searchDiv);
    // $('<br>').appendTo(searchDiv);

    let tabCol = $('<div/>').addClass("border rounded-2 my-3 flex-grow-1 overflow-auto").appendTo(leftCol);

    $('<div/>', { role: 'tablist', id: 'list-tab', class: 'list-group' }).appendTo(tabCol);
    $('<div/>', { id: 'nav-tabContent', class: 'tab-content' }).appendTo(paneCol);

    getSearchResults();
    $('#search').on('input', debouncedGetResults);

    let addNew = $('<button/>', { type: 'button', class: 'btn btn-success mb-2', id: 'new-hotspot', text: 'Add New' }).appendTo(leftCol);
    addNew.click(createNewHotspot);

    $(".selectpicker").selectpicker('render');
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
}

function populateHotspots(hotspots) {
    $('#list-tab').empty();
    $('#nav-tabContent').empty();
    let i = 0;
    for (let hotspot of hotspots) {
        if (i == 0) {
            makeTabElem(hotspot).addClass("active").appendTo('#list-tab');
            makePaneElem(hotspot).addClass("active show").appendTo('#nav-tabContent');
        }
        else {
            makeTabElem(hotspot).appendTo('#list-tab');
            makePaneElem(hotspot).appendTo('#nav-tabContent');
        }
        i += 1;
    }
}

function getSearchResults() {
    let query = $('#search').val();

    const by_name_hotspots = hotspots.filter(item => item["name"].toLowerCase().includes(query.toLowerCase()));

    populateHotspots(by_name_hotspots);
    $(".selectpicker").selectpicker('render');
}

let search_check_timer = null;

function debouncedGetResults() {
    clearTimeout(search_check_timer);
    search_check_timer = setTimeout(getSearchResults, 500);
}

function createNewHotspot() {
    console.log("made new!")
    $(".active").removeClass("active show");
    if ($("#list-new")) {
        $("#list-new").remove();
    }
    makePaneElem(null).appendTo('#nav-tabContent');
    $(".selectpicker").selectpicker('render');
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
}

function makeTabElem(hotspot) {
    let infoTab = {
        class: 'list-group-item list-group-item-action',
        id: 'list-' + hotspot['hotspot_id'] + '-tab',
        'data-bs-toggle': 'list',
        href: '#list-' + hotspot['hotspot_id'],
        role: 'tab',
        'aria-controls': 'list-' + hotspot['hotspot_id'],
        text: hotspot['name']
    };

    return $('<a/>', infoTab);
}

function makePaneElem(hotspot) {

    if (hotspot == null) {
        let tabPane = $('<div/>', { class: 'tab-pane fade border rounded active show', id: 'list-new', role: 'tabpanel', 'aria-labelledby': 'list-new-list' })
        makeHotspotCard(null).appendTo(tabPane);
        return tabPane;
    }

    let infoPane = {
        class: 'tab-pane fade border rounded',
        id: 'list-' + hotspot['hotspot_id'],
        role: 'tabpanel',
        'aria-labelledby': 'list-' + hotspot['hotspot_id'] + '-list'
    };

    let tabPane = $('<div/>', infoPane);
    makeHotspotCard(hotspot).appendTo(tabPane);
    return tabPane;
}

function makeHotspotCard(hotspot) {
    let hotspotCard = $('<div/>').addClass("m-3");
    let id = hotspot ? hotspot['hotspot_id'] : 'new';

    let tagList = [];
    if (hotspot != null) {
        for (let tag of hotspot['tags']) {
            tagList.push(tag['tag_name']);
        }
    }

    let selector = $("<select id=\"select" + id + "\" class=\"selectpicker\" data-size=\"10\" data-width=\"50%\" multiple></select>");
    let optGroups = ["Cost", "Establishment", "Accessibility", "Password", "Amenities"].map(category => {
        return $(`<optgroup id="${category}${id}" label="${category}" data-max-options="1">`);
    });

    for (let tag of tags) {
        let optGroup = optGroups.find(opt => opt.attr('id') == tag['category'] + id);
        $("<option id=\"" + tag['tag_id'] + "\">" + tag['tag_name'] + "</option>").appendTo(optGroup);
    }
    selector.append(optGroups);

    if (tagList.length > 0) {
        selector.val(tagList);
    }

    $('<label/>', { for: 'hotspot-title' + id, text: 'Title', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-title' + id, maxlength: '80', class: 'form-control mb-3', value: hotspot ? hotspot['name'] : '' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-address' + id, text: 'Address', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-address' + id, maxlength: '150', class: 'form-control', value: hotspot ? hotspot['address'] : '' }).appendTo(hotspotCard);
    $('<div/>').addClass('form-text mb-3').text("Example: 123 NE 25th St. Princeton, NJ 08544").appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-lati' + id, text: 'Latitude', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-lati' + id, class: 'form-control mb-3', value: hotspot ? hotspot['latitude'] : '', disabled: '' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-long' + id, text: 'Longitude', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-long' + id, class: 'form-control mb-3', value: hotspot ? hotspot['longitude'] : '', disabled: '' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-tags' + id, text: 'Tags', class: 'form-label' }).appendTo(hotspotCard);
    // $('<input/>', { type: 'text', id: 'hotspot-tags', class: 'form-control', 'aria-describedby': 'tag-info', value: tags }).appendTo(hotspotCard);
    $("<br/>").appendTo(hotspotCard);
    selector.appendTo(hotspotCard);
    $("<br/>").appendTo(hotspotCard);
    $("<br/>").appendTo(hotspotCard);
    // $('<div/>', { class: 'form-text mb-3', id: 'tag-info', text: 'Enter tags as a comma-delimited list' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-ul' + id, text: 'Upload Speed', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-ul' + id, class: 'form-control', value: hotspot ? hotspot['ul_speed'] : -1 }).appendTo(hotspotCard);
    $('<div/>').addClass('form-text mb-3').text("Default (unknown) value: -1").appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-dl' + id, text: 'Download Speed', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-dl' + id, class: 'form-control', value: hotspot ? hotspot['dl_speed'] : -1 }).appendTo(hotspotCard);
    $('<div/>').addClass('form-text mb-3').text("Default (unknown) value: -1").appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-desc' + id, text: 'Description', class: 'form-label' }).appendTo(hotspotCard);
    $('<textarea/>', { type: 'text', id: 'hotspot-desc' + id, maxlength: '300', class: 'form-control mb-3' }).text(hotspot ? hotspot['descrip'] : '').appendTo(hotspotCard);

    // $('<button/>', { type: 'submit', class: 'btn btn-success me-2 mt-2', text: 'Save Changes' }).appendTo(hotspotCard);

    let confirmChanges = $('<a/>', { id: 'confirmChanges' + id, type: "button", class: "btn btn-secondary", text: 'Confirm' });

    $('<button/>', {
        type: 'submit',
        id: 'approve' + id,
        class: 'btn btn-success me-2 mt-2',
        'data-bs-container': "body",
        'data-bs-custom-class': 'popover-center',
        'data-bs-toggle': "popover",
        'data-bs-placement': "bottom",
        'data-bs-html': true,
        'data-bs-trigger': "focus",
        title: '<small>Confirm Selection</small>',
        'data-bs-content': confirmChanges.prop('outerHTML'),
        text: 'Save Changes'
    }).appendTo(hotspotCard);


    if (hotspot != null) {
        let confirmDelete = $('<a/>', { id: 'confirmDelete' + id, type: "button", class: "btn btn-secondary", text: 'Confirm' });

        $('<button/>', {
            type: 'submit',
            id: 'delete' + id,
            class: 'btn btn-danger me-2 mt-2',
            'data-bs-container': "body",
            'data-bs-custom-class': 'popover-center',
            'data-bs-toggle': "popover",
            'data-bs-placement': "bottom",
            'data-bs-html': true,
            'data-bs-trigger': "focus",
            title: '<small>Confirm Selection</small>',
            'data-bs-content': confirmDelete.prop('outerHTML'),
            text: 'Delete Hotspot'
        }).appendTo(hotspotCard);

        $(document).on('click', '#confirmDelete' + id, function () {
            deleteHotspot(id);
        });

        $(document).on('click', '#confirmChanges' + id, function () {
            updateHotspot(id);
        });
    }

    else {
        $(document).on('click', '#confirmChanges' + id, function () {
            console.log("failed!");
            addHotspot();
        });
    }

    let reset = $('<button/>', { type: 'button', class: 'btn btn-secondary me-2 mt-2', text: 'Reset Fields' }).appendTo(hotspotCard);
    reset.click(function () { resetQuery(id) });
    return hotspotCard;
}

function buildHotspot(id = 'new') {
    let hotspot = {};
    let newTags = $('#select' + id).val();

    hotspot['tags'] = [];

    for (let tag of tags) {
        if (newTags.includes(tag['tag_name'])) {
            hotspot['tags'].push(tag);
        }
    }

    hotspot['hotspot_id'] = parseInt(id) || 'new';
    hotspot['address'] = $('#hotspot-address' + id).val();
    hotspot['name'] = $('#hotspot-title' + id).val();

    let ulSpeed = parseFloat($('#hotspot-ul' + id).val());
    let dlSpeed = parseFloat($('#hotspot-dl' + id).val());

    $('#hotspot-ul' + id).val(Number.isInteger(ulSpeed) ? ulSpeed : -1);
    $('#hotspot-dl' + id).val(Number.isInteger(dlSpeed) ? dlSpeed : -1);

    hotspot['ul_speed'] = parseFloat($('#hotspot-ul' + id).val());
    hotspot['dl_speed'] = parseFloat($('#hotspot-dl' + id).val());

    hotspot['descrip'] = $('#hotspot-desc' + id).val();
    hotspot['latitude'] = parseFloat($('#hotspot-lati' + id).val());
    hotspot['longitude'] = parseFloat($('#hotspot-long' + id).val());

    return hotspot;
}

function buildData(id = 'new') {
    let hotspot = {};
    let newTags = $('#select' + id).val();

    hotspot['tags'] = [];

    for (let tag of tags) {
        if (newTags.includes(tag['tag_name'])) {
            hotspot['tags'].push(tag['tag_id']);
        }
    }
    if (id !== 'new')
        hotspot['hotspot_id'] = parseInt(id);

    hotspot['address'] = $('#hotspot-address' + id).val();
    hotspot['location_name'] = $('#hotspot-title' + id).val();
    hotspot['upload_speed'] = parseFloat($('#hotspot-ul' + id).val()) || -1;
    hotspot['download_speed'] = parseFloat($('#hotspot-dl' + id).val()) || -1;
    hotspot['description'] = $('#hotspot-desc' + id).val();
    hotspot['latitude'] = parseFloat($('#hotspot-lati' + id).val());
    hotspot['longitude'] = parseFloat($('#hotspot-long' + id).val());

    return hotspot;
}

function addHotspot() {
    if (!verifyHotspot()) {
        return;
    }

    let hotspot = buildHotspot();
    let data = buildData();

    let addRequest = {
        type: 'POST',
        url: "/api/create_hotspots",
        data: JSON.stringify([data]),
        contentType: 'application/json',
        headers: {
            'X-CSRFToken': csrfToken
        },
        error: function () {
            makeToast(false, "Server Error. Unable to add hotspot.");
        },
        success: function () {
            hotspots.push(hotspot);
            resetPaneView('new');
            makeToast(true, "Successfully added hotspot!");
            setupMap();
        }
    };

    $.ajax(addRequest);
}

function updateHotspot(id) {
    if (!verifyHotspot(id)) {
        return
    }
    console.log("updating");

    let hotspot = buildHotspot(id);
    let data = buildData(id);

    let updateRequest = {
        type: 'POST',
        url: "/api/modify_hotspots",
        data: JSON.stringify([data]),
        contentType: 'application/json',
        headers: {
            'X-CSRFToken': csrfToken
        },
        error: function () {
            makeToast(false, "Server Error. Unable to update hotspot.");
            return;
        },
        success: function () {
            console.log("successfully modified!");
            hotspots = hotspots.map(old_hotspot => old_hotspot['hotspot_id'] === id ? hotspot : old_hotspot);
            makeToast(true, "Successfully updated hotspot!");
            resetPaneView(id);
        }
    };

    $.ajax(updateRequest);
}

function deleteHotspot(id) {
    let deleteRequest = {
        type: 'POST',
        url: "/api/delete_hotspots",
        data: JSON.stringify([id]),
        contentType: 'application/json',
        error: function () {
            makeToast(false, "Server Error. Unable to delete hotspot.");
            return;
        },
        success: function () {
            hotspots = hotspots.filter(hotspot => hotspot['hotspot_id'] !== id);
            makeToast(true, "Successfully deleted hotspot!");
            resetPaneView(id);
            setup();
        }
    };

    $.ajax(deleteRequest);
}

function resetPaneView(id) {
    $('#list-' + id + '-tab').text($('#hotspot-title' + id).val());
    $('#list-' + id + '-tab').removeClass('active');
    $('#list-' + id).removeClass("active show");

    $('#list-tab > :first-child').addClass('active');
    $('#nav-tabContent > :first-child').addClass('active show');
}

function resetQuery(id) {
    $('#list-' + id).empty();

    let hotspot = getHotspot(hotspots, id);
    $(document).off('click', '#confirmChanges' + id);
    $(document).off('click', '#confirmDelete' + id);

    $('#list-' + id).append(makeHotspotCard(hotspot));
    $(".selectpicker").selectpicker('render');
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
}

function verifyHotspot(id = 'new') {
    let title = $('#hotspot-title' + id).val();
    let address = $('#hotspot-address' + id).val();

    if (!title) {
        makeToast(false, "Please provide a hotspot title.");
        return false;
    }

    if (!address) {
        makeToast(false, "Please provide a hotspot address.");
        return false;
    }

    let url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + address + ".json?proximity=ip&access_token=pk.eyJ1IjoianY4Mjk0IiwiYSI6ImNsbzRzdjQyZjA0bDgycW51ejdtYXBteWEifQ.5epqP-7J4pRUTJAmYygM8A"
    let result = true;

    let addressRequestData = {
        type: 'GET',
        url: url,
        async: false,
        success: function (data) {
            let points = data['features']
            if (points.length == 0) {
                makeToast(false, "No valid address found. Please try again.");
                result = false;
            }
            else {
                $('#hotspot-lati' + id).val(points[0]['center'][1]);
                $('#hotspot-long' + id).val(points[0]['center'][0]);

                let start = points[0]['place_name'];
                let index = start.indexOf(points[0]['properties']['address']);

                $('#hotspot-address' + id).val(start.substring(index));
                // setTimeout(function () { }, 4000);
            }
        },
        error: function () {
            makeToast(false, "A MapBox server error has occurred.");
            result = false;
        }
    };

    $.ajax(addressRequestData);

    return result;
}
