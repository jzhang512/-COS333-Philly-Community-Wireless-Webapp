function generateFeatures(hotspots) {
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
                'ID': '' + hotspot['unique_id']
            }
        })
    })

    return data;
}
