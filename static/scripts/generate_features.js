// If tagIds is empty, no filtering done. All hotspots returned.
function filterByTag(hotspots, tagIds=[]) {
    let hotspotsFiltered = [];

    // No filter.
    if (tagIds.length == 0) {
        return hotspots;
    }

    // Categories
    let cat_bools = [true, true, true, true, true, true];
    const cat_num = {'Cost': 0, 'Privacy': 1, 'Password': 2, 'Amenities': 3,
                     'Accessibility': 4, 'Establishment': 5};

    let tags = [];
    
    // Set categorys that are included in tagIds to false
    tagIds.forEach((id) => {
        let tag = getTag(id);
        tags.push(tag);
        let cat = tag['category'];
        cat_bools[cat_num[cat]] = false;
    })

    hotspots.forEach((hotspot) => {
        hotspotTagIds = new Set();
        hotspot['tags'].forEach((tag) => hotspotTagIds.add(tag['tag_id']));

        // Add if hotspot has a least 1 tag from each category
        let bools_copy = [...cat_bools];
        tags.forEach((tag) => {
            let id = tag['tag_id'];
            let cat = tag['category'];
            if (hotspotTagIds.has(id)) bools_copy[cat_num[cat]] = true;
        })
        let add = true;
        bools_copy.forEach((bool) => add = add && bool);
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
