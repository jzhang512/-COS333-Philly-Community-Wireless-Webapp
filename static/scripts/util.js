function getHotspot(hotspots, id) {
    for (const hotspot of hotspots) {
        if (hotspot['hotspot_id'] == id) return hotspot;
    }
    return {};
}

// function setup() {

// }

// $('document').ready(setup);