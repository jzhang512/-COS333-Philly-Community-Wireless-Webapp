// $('#new-hotspot').click(createNewHotspot);
let hotspots = null;
let tags = null;

function setupMap() {
    history.pushState(null, "Update Map", "/admin/update");
    $("#results-div").empty();

    let requestData = {
        type: 'GET',
        url: "/api/hotspots",
        success: handleResponseMap
    };

    let tagRequestData = {
        type: 'GET',
        url: "/api/tags",
        success: handleResponseTag
    };

    $.ajax(tagRequestData);
    $.ajax(requestData);
}

function populateHotspots(hotspots) {
    console.log("populating!");
    $('#results-div').addClass('overflow-hidden');
    $('<h2/>').addClass("m-3").text("Update/Add/Remove Hotspots").appendTo('#results-div');
    let mainGrid = $('<div/>').addClass("row mt-3").appendTo('#results-div');
    let hotspotsCol = $('<div/>').addClass("col-4 overflow-auto border-end").appendTo(mainGrid);
    // $('<h2/>').text("Hotspots").appendTo(hotspotsCol);
    let tabGroup = $('<div/>', { role: 'tablist', id: 'list-tab', class: 'list-group' }).appendTo(hotspotsCol);
    let pane = $('<div/>').addClass("col-8 overflow-auto").appendTo(mainGrid);
    let paneGroup = $('<div/>', { id: 'nav-tabContent', class: 'tab-content' }).appendTo(pane);
    // listGroup.prop('role', 'tablist');
    // listGroup.prop('id', 'list-tab');

    for (let hotspot of hotspots) {
        makeTabElem(hotspot).appendTo(tabGroup);
        makePaneElem(hotspot).appendTo(paneGroup);
    }

    let addNew = $('<button/>', { type: 'button', class: 'btn btn-success my-3', id: 'new-hotspot', text: 'Add New' }).appendTo(hotspotsCol);
    addNew.click(createNewHotspot);
    $(".selectpicker").selectpicker('render');
}

function createNewHotspot() {
    console.log("made new!")
    $(".active").removeClass("active show");
    if ($("#list-new")) {
        $("#list-new").remove();
    }
    makePaneElem(null).appendTo('#nav-tabContent');
    $(".selectpicker").selectpicker('render');
}

function handleResponseMap(data) {
    hotspots = data;
    populateHotspots(data);
}

function handleResponseTag(data) {
    tags = data;
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
    console.log(hotspot);

    let hotspotCard = $('<div/>').addClass("m-3");
    let id = hotspot ? hotspot['hotspot_id'] : 'new';
    // console.log(tags);

    let tagDict = {};
    let tagList = [];
    if (hotspot != null) {
        for (let tag of hotspot['tags']) {
            tagDict[tag['tag_id']] = tag['tag_name'];
            tagList.push(tag['tag_name']);
        }
    }

    let selector = $("<select id=\"select" + id + "\" class=\"selectpicker\" multiple></select>");

    for (let tag of tags) {
        $("<option id=\"" + tag['tag_id'] + "\">" + tag['tag_name'] + "</option>").appendTo(selector);
    }

    if (tagList.length > 0)
        selector.val(tagList);
    //'#select' + hotspot['pin_id']

    $('<label/>', { for: 'hotspot-title' + id, text: 'Title:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-title' + id, class: 'form-control mb-3', value: hotspot ? hotspot['location_name'] : '' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-address' + id, text: 'Address:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-address' + id, class: 'form-control mb-3', value: hotspot ? hotspot['address'] : '' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-lati' + id, text: 'Latitude:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-lati' + id, class: 'form-control mb-3', value: hotspot ? hotspot['latitude'] : '', disabled: '' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-long' + id, text: 'Longitude:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-long' + id, class: 'form-control mb-3', value: hotspot ? hotspot['longitude'] : '', disabled: '' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-tags' + id, text: 'Tags:', class: 'form-label' }).appendTo(hotspotCard);
    // $('<input/>', { type: 'text', id: 'hotspot-tags', class: 'form-control', 'aria-describedby': 'tag-info', value: tags }).appendTo(hotspotCard);
    $("<br/>").appendTo(hotspotCard);
    selector.appendTo(hotspotCard);
    $("<br/>").appendTo(hotspotCard);
    $("<br/>").appendTo(hotspotCard);
    // $('<div/>', { class: 'form-text mb-3', id: 'tag-info', text: 'Enter tags as a comma-delimited list' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-ul' + id, text: 'Upload Speed:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-ul' + id, class: 'form-control mb-3', value: hotspot ? hotspot['ul_speed'] : '' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-dl' + id, text: 'Download Speed:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-dl' + id, class: 'form-control mb-3', value: hotspot ? hotspot['dl_speed'] : '' }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-desc' + id, text: 'Description:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-desc' + id, class: 'form-control mb-3', value: hotspot ? hotspot['descrip'] : '' }).appendTo(hotspotCard);

    let add = $('<button/>', { type: 'button', class: 'btn btn-success', text: 'Save Changes' }).appendTo(hotspotCard);


    if (hotspot != null) {
        let del = $('<button/>', { type: 'button', class: 'btn btn-danger ms-2', text: 'Delete Hotspot' }).appendTo(hotspotCard);
        del.click(function () {
            deleteHotspot(id);
        });
        add.click(function () {
            updateHotspot(id);
        });
    }
    else {
        add.click(function () {
            addHotspot();
        });
    }

    let cancel = $('<button/>', { type: 'button', class: 'btn btn-secondary ms-2', text: 'Cancel' }).appendTo(hotspotCard);
    cancel.click(function () { cancelQuery(id) });
    return hotspotCard;
}

function buildHotspot(id = 'new') {
    let hotspot = {};
    let newTags = $('#select' + id).val();

    hotspot['tags'] = [];

    for (let tag of tags) {
        if (newTags.includes(tag['tag_name'])) {
            hotspot['tags'].push(tag['tag_id']);
        }
    }
    hotspot['hotspot_id'] = id;
    hotspot['address'] = $('#hotspot-address' + id).val();
    hotspot['location_name'] = $('#hotspot-title' + id).val();
    hotspot['upload_speed'] = $('#hotspot-ul' + id).val();
    hotspot['download_speed'] = $('#hotspot-dl' + id).val();
    hotspot['description'] = $('#hotspot-desc' + id).val();
    hotspot['latitude'] = $('#hotspot-lati' + id).val();
    hotspot['longitude'] = $('#hotspot-long' + id).val();

    return hotspot;
}

function addHotspot() {
    if (!verifyHotspot()) {
        console.log("error with verification");
        return
    }

    let hotspot = buildHotspot();

    let addRequest = {
        type: 'POST',
        url: "/api/create_hotspots",
        data: JSON.stringify([hotspot]),
        contentType: 'application/json'
    };

    $.ajax(addRequest);
    resetPaneView('new');
    console.log("successfulyl modified!")
}

function updateHotspot(id) {
    if (!verifyHotspot(id)) {
        alert("error with verification");
        return
    }

    let hotspot = buildHotspot(id);

    let updateRequest = {
        type: 'POST',
        url: "/api/modify_hotspots",
        data: JSON.stringify([hotspot]),
        contentType: 'application/json'
    };

    $.ajax(updateRequest);
    resetPaneView(id);
    console.log("successfulyl modified!")
}

function deleteHotspot(id) {
    if (!verifyHotspot(id)) {
        alert("error with verification");
        return
    }
    
    let deleteRequest = {
        type: 'POST',
        url: "/api/delete_hotspots",
        data: JSON.stringify([id]),
        contentType: 'application/json'
    };

    $.ajax(deleteRequest);
    console.log("deleted " + id);
    resetPaneView(id);
    return
}

function resetPaneView(id) {
    $('#list-' + id + '-tab').removeClass('active');
    $('#list-' + id).removeClass("active show");
}

function cancelQuery(id) {
    $('#list-' + id).empty();
    resetPaneView(id)

    let hotspot = getHotspot(hotspots, id);
    $('#list-' + id).append(makeHotspotCard(hotspot));
    $(".selectpicker").selectpicker('render');
}

function verifyHotspot(id = 'new') {
    let address = $('#hotspot-address' + id).val();
    let url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + address + ".json?proximity=ip&access_token=pk.eyJ1IjoianY4Mjk0IiwiYSI6ImNsbzRzdjQyZjA0bDgycW51ejdtYXBteWEifQ.5epqP-7J4pRUTJAmYygM8A"
    let result = true;

    let addressRequestData = {
        type: 'GET',
        url: url,
        async: false,
        success: function (data) {
            let points = data['features']
            if (points.length == 0) {
                console.log("ADDRESS ERROR!");
                alert("address invalid");
                result = false;
            }
            else {
                console.log("CHANGING LONG/LAT");
                $('#hotspot-lati' + id).val(points[0]['center'][1]);
                $('#hotspot-long' + id).val(points[0]['center'][0]);
            }
        },
        error: function () {
            alert("An error has occured.");
            result = false;
        }
    };

    $.ajax(addressRequestData);

    return result;
}
