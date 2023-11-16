$('#update-map').click(setupMap);

function setupMap() {
    $("#results-div").empty();

    let requestData = {
        type: 'GET',
        url: "/api/hotspots",
        success: handleResponseMap
    };

    $.ajax(requestData);
}

function populateHotspots(hotspots) {
    console.log("populating!");
    let mainGrid = $('<div/>').addClass("row").appendTo('#results-div');
    let hostpots = $('<div/>').addClass("col-4").appendTo(mainGrid);
    let tabGroup = $('<div/>', { role: 'tablist', id: 'list-tab', class: 'list-group' }).appendTo(hostpots);
    let pane = $('<div/>').addClass("col-8").appendTo(mainGrid);
    let paneGroup = $('<div/>', { id: 'nav-tabContent', class: 'tab-content' }).appendTo(pane);
    // listGroup.prop('role', 'tablist');
    // listGroup.prop('id', 'list-tab');

    // let infoList = {
    //     class: 'list-group-item list-group-item-action',
    //     id: 'list-home-list',
    //     'data-bs-toggle': 'list',
    //     // href: '#list-home',
    //     role: 'tab',
    //     // 'aria-controls': 'list-home',
    //     // text: 'Home'
    // };

    // let infoPane = {
    //     class: 'tab-pane fade show active',
    //     id: 'list-home',
    //     role: 'tabpanel',
    //     'aria-labelledby': 'list-home-list',
    //     // text: ''
    // }

    for (let hotspot of hotspots) {
        makeTabElem(hotspot).appendTo(tabGroup);
        makePaneElem(hotspot).appendTo(paneGroup);

        // $('<a/>', infoList).text(hotspot['title']).appendTo(listGroup);
        // $('<div/>',)
    }
}

function handleResponseMap(data) {
    console.log(data);
    populateHotspots(data);
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

    let tags = hotspot['tags'].map(function (item) {
        return "\"" + item['tag_name'] + "\"";
    });

    console.log(tags);

    $('<label/>', { for: 'hotspot-title', text: 'Title:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-title', class: 'form-control mb-3', value: hotspot['name'] }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-address', text: 'Address:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-address', class: 'form-control mb-3', value: hotspot['address'] }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-tags', text: 'Tags:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-tags', class: 'form-control mb-3', value: tags.join(',') }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-ul', text: 'Upload Speed:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-ul', class: 'form-control mb-3', value: hotspot['ul_speec'] }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-dl', text: 'Download Speed:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-dl', class: 'form-control mb-3', value: hotspot['dl_speed'] }).appendTo(hotspotCard);

    $('<label/>', { for: 'hotspot-desc', text: 'Description:', class: 'form-label' }).appendTo(hotspotCard);
    $('<input/>', { type: 'text', id: 'hotspot-desc', class: 'form-control mb-3', value: hotspot['descrip'] }).appendTo(hotspotCard);

    return hotspotCard;
}

// Input sample:
{/* <div class="input-group mb-3">
  <label for="basic-url" class="form-label">Your vanity URL</label>
  <input type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2">
  <span class="input-group-text" id="basic-addon2">@example.com</span>
</div> */}
// A pin should have the following fields:
//     {
//         hotspot_id: int
//         name: string
//         address: string
//         latitude: float
//         longitude: float
//         ul_speed: float (>0)
//         dl_speed: float (>0)
//         descrip: string
//         tags: list of dicts (see get_tags for tag fields)
//     }

{/* <div class="row">
  <div class="col-4">
    <div class="list-group" id="list-tab" role="tablist">
      <a class="list-group-item list-group-item-action active" id="list-home-list" data-bs-toggle="list" href="#list-home" role="tab" aria-controls="list-home">Home</a>
      <a class="list-group-item list-group-item-action" id="list-profile-list" data-bs-toggle="list" href="#list-profile" role="tab" aria-controls="list-profile">Profile</a>
      <a class="list-group-item list-group-item-action" id="list-messages-list" data-bs-toggle="list" href="#list-messages" role="tab" aria-controls="list-messages">Messages</a>
      <a class="list-group-item list-group-item-action" id="list-settings-list" data-bs-toggle="list" href="#list-settings" role="tab" aria-controls="list-settings">Settings</a>
    </div>
  </div>
  <div class="col-8">
    <div class="tab-content" id="nav-tabContent">
      <div class="tab-pane fade show active" id="list-home" role="tabpanel" aria-labelledby="list-home-list">...</div>
      <div class="tab-pane fade" id="list-profile" role="tabpanel" aria-labelledby="list-profile-list">...</div>
      <div class="tab-pane fade" id="list-messages" role="tabpanel" aria-labelledby="list-messages-list">...</div>
      <div class="tab-pane fade" id="list-settings" role="tabpanel" aria-labelledby="list-settings-list">...</div>
    </div>
  </div>
</div> */}