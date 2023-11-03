function getHotspot(hotspots, id) {
    for(const hotspot of hotspots) {
        if (hotspot['unique_id'] == id) return hotspot;
    }
    return {};
}
