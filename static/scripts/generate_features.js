function generateFeatures(hotspots, tagIds=[]) {
    // Only adds features that contain ALL tags in tagIds
    data = {
        'type': 'FeatureCollection',
        'features': []
    };

    hotspots.forEach((hotspot) => {
        // add tag_id's to set for faster lookup
        hotspotTagIds = new Set();
        hotspot['tags'].forEach((tag) => hotspotTagIds.add(tag['tag_id']));

        // if hotspot doesn't have right tags then move to next one
        add = true;
        tagIds.forEach((id) => {
            if (!hotspotTagIds.has(id)) add = false;
        })
        if (!add) return;

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
