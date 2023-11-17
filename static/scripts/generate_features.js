function filterByTag(hotspots, tagIds=[]) {
    let hotspotsFiltered = [];

    hotspots.forEach((hotspot) => {
        hotspotTagIds = new Set();
        hotspot['tags'].forEach((tag) => hotspotTagIds.add(tag['tag_id']));

        // if hotspot doesn't have right tags then move to next one
        add = true;
        tagIds.forEach((id) => {
            if (!hotspotTagIds.has(id)) add = false;
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
