function addLayer(features, remove=false) {
    if (remove) {
        map.removeLayer('points');
        map.removeSource('points');
    }

    // Add a GeoJSON source with 2 points
    map.addSource('points', {
        'type': 'geojson',
        'data': features
    });

    // Add a symbol layer
    map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
            'icon-image': 'custom-marker',
            // get the title name from the source's "title" property
            'text-field': ['get', 'title'],
            'text-font': [
                'Open Sans Semibold',
                'Arial Unicode MS Bold'
            ],
            'text-offset': [0, 1.25],
            'text-anchor': 'top'
        }
    });
}