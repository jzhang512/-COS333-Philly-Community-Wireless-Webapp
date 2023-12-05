// Miscellaneous functions.

function getHotspot(id) {
    for (const hotspot of hotspots) {
        if (hotspot['hotspot_id'] == id) return hotspot;
    }
    return null;
}

function getTag(id) {
    for (const tag of tags) {
        if (tag['tag_id'] == id) return tag;
    }
    return null;
}
