mock_tags = [{
    'tag_id': 1,
    'name': 'free',
    'category': 'cost'
},
{
    'tag_id': 2,
    'name': 'paid',
    'category': 'cost'
},
{
    'tag_id': 3,
    'name': 'free w/ purchase',
    'category': 'cost'
},
{
    'tag_id': 4,
    'name': 'no password',
    'category': 'privacy'
},
{
    'tag_id': 5,
    'name': 'password available',
    'category': 'privacy'
},
{
    'tag_id': 6,
    'name': 'register w/ email',
    'category': 'privacy'
},
{
    'tag_id': 7,
    'name': 'cafe/restaurant',
    'category': 'establishment'
},
{
    'tag_id': 8,
    'name': 'library/museum',
    'category': 'establishment'
},
{
    'tag_id': 9,
    'name': 'school',
    'category': 'establishment'
},
{
    'tag_id': 10,
    'name': 'indoors',
    'category': 'location'
},
{
    'tag_id': 11,
    'name': 'outdoors',
    'category': 'location'
}]


mock_pins = [{
    'name': 'Museum of Art',
    'id': 1,
    'address': '2600 Benjamin Franklin Pkwy',
    'latitude': 39.96535587558521,
    'longitude': -75.18060132326991,
    'ul_speed': 20.0,
    'dl_speed': 25.0,
    'descrip': 'Wifi available in lobby',
    'tags': [mock_tags[2], mock_tags[3], mock_tags[7], mock_tags[9]]
 },
 {
    'name': 'Parkway Central Library',
    'id': 2,
    'address': '1901 Vine St',
    'latitude': 39.95953376814817,
    'longitude': -75.1710559618813,
    'ul_speed': 40.0,
    'dl_speed': 40.0,
    'descrip': '',
    'tags': [mock_tags[0], mock_tags[4], mock_tags[7], mock_tags[9]]
}]


mock_reviews = [{
    'pin_id': 1,
    'text': 'Good wifi!',
    'stars': 5,
    'time': '2024-01-01 12:00:00'
},
{
    'pin_id': 1,
    'text': 'Ok...',
    'stars': 3,
    'time': '2024-01-01 12:00:00'
},
{
    'pin_id': 2,
    'text': 'Works',
    'stars': 5,
    'time': '2024-01-01 12:00:00'
}]
