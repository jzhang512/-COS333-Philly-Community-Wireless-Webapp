function getHotspot(id) {
    for (const hotspot of hotspots) {
        if (hotspot['hotspot_id'] == id) return hotspot;
    }
    return null;
}

// function setup() {

// }

// $('document').ready(setup);