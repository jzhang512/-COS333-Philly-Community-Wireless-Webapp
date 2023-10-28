"""
Contains complete database API used by server. All implementation should be in
db package.
"""

from db.mock_data import mock_pins, mock_reviews, mock_tags

def get_pins():
    """
    Should return a list of all pins (each pin represented as a dictionary) 
    with relevant information.
    
    A pin should have the following fields:
    {
        name: string
        id: int
        address: string
        latitude: float
        longitude: float
        ul_speed: float
        dl_speed: float
        descrip: string
        tags: list of dicts (see get_tags for tag fields)
    }
    """
    
    return mock_pins


def get_tags(category: str = ""):
    """
    Returns a list of tags (each tag is represented as pin). If category is
    empty, returns all tags, otherwise returns only tags that match the given
    category.

    A tag should have the following fields:
    {
        tag_id: int
        name: string
        category: string
    }

    Valid categories are (we can add more as necessary):
        'cost',
        'privacy' (maybe rename to accessibility?),
        'establishment',
        'location' (indoor/outdoor, maybe pick better name?)
    """

    if category == 'cost':
        return mock_tags[0:3]
    if category == 'cost':
        return mock_tags[3:6]
    if category == 'cost':
        return mock_tags[6:9]
    if category == 'cost':
        return mock_tags[9:10]
    return mock_tags


def get_reviews(pin_id: int):
    """
    Returns a list of of reviews associated with pin with given pin_id. Each
    pin is represented as a dict.

    A review should have the following fields:
    {
        pin_id: int
        text: string
        stars: int (1-5)
        time: string ('YYYY-MM-DD HH:MM:SS')s
    }
    """
    return [review['pin_id'] == pin_id for review in mock_reviews]
