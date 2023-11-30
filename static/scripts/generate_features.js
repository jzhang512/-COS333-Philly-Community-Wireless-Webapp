// If tagIds is empty, no filtering done. All hotspots returned.
function filterByTag(hotspots, tagIds=[]) {
    let hotspotsFiltered = [];

    // No filter.
    if (tagIds.length == 0) {
        return hotspots;
    }

    hotspots.forEach((hotspot) => {
        hotspotTagIds = new Set();
        hotspot['tags'].forEach((tag) => hotspotTagIds.add(tag['tag_id']));

        // Add if hotspot has a least 1 tag filtered for.
        add = false;
        tagIds.forEach((id) => {
            if (hotspotTagIds.has(id)) add = true;
        })
        if (add) hotspotsFiltered.push(hotspot);
    })

    return hotspotsFiltered;
}

function generateFeatures(hotspots) {
    // Only adds features that contain ALL tags in tagIds
    // Only pass tag_id's, not the whole dictionary
    data = {
        'type': 'FeatureCollection',
        'features': []
    };

    hotspots.forEach((hotspot) => {
        data['features'].push({
            // feature for Mapbox DC
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [hotspot['longitude'], hotspot['latitude']]
            },
            'properties': {
                'title': hotspot['name'],
                'description': 'sample hotspot',
                'ID': '' + hotspot['hotspot_id']
            }
        })
    })

    return data;
}
