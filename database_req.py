# ---------------------------------------------------------------------
# database_req.py
# ---------------------------------------------------------------------

"""
Contains complete database API used by server. All implementation 
should be in db package.
"""

# ---------------------------------------------------------------------

from db.mock_data import mock_pins, mock_reviews, mock_tags
import db.read_data

# ---------------------------------------------------------------------
# Read-Only Functions (public user).

def get_pins():
    """
    Should return a list of all pins (each pin represented as a dictionary) 
    with relevant information.
    
    A pin should have the following fields:
    {
        unique_id: int
        name: string
        address: string
        latitude: float
        longitude: float
        ul_speed: real
        dl_speed: real
        descrip: string
        tags: list of dicts (see get_tags for tag fields)
    }
    """
    
    return db.read_data.get_pins_all()

# ----------------------------------

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
    if category == 'privacy':
        return mock_tags[3:6]
    if category == 'establishment':
        return mock_tags[6:9]
    if category == 'location':
        return mock_tags[9:10]
    return mock_tags

# ----------------------------------

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

    return db.read_data.get_single_review(pin_id)

# ---------------------------------------------------------------------
# Write Functions (mostly admin use exception being user-left review).

def add_user_review(unique_id, rating, comment, time):
    """
    Adds a user left review to the pending table.
    """
    return

# ----------------------------------

def remove_hotspots(remove_list):
    """
    Removes hotspots specified by list (via unique_id?) from the
    database. Does nothing for hotspots that don't exist or given empty
    list.
    """
    return

# ----------------------------------

def hide_hotspots(hide_list):
    """
    Hides hotspots specified by list on map and database. Alternative
    to removing hotspot data (still want to keep the data but not show
    it).
    """
    return

# ----------------------------------

def update_hotspots(hotspots, fields):
    """
    Updates the corresponding hotspots data.
    """
    return 

# ----------------------------------

def add_tags(tag_details):
    """
    Add new tags for classification. tag_details in dict format.
    """
    return

# ----------------------------------

def delete_tags(tag_id):
    """
    Delete tags.
    """
    return

# ----------------------------------

def update_tags(tag_ids):
    """
    Update the given tags' details. Does not assign tags to hotspots
    (this is done in update_hotspots()).
    """
    return

# ----------------------------------

def decide_reviews(review_id):
    """
    Approve or reject the pending review. Approved reviews will move
    to the reviews_approved table, otherwise delete.
    """
    return

# ---------------------------------------------------------------------
# Admin Functions.

def create_username(username):
    """
    Creates a username supplied by admin for own account.
    """
    return

# ----------------------------------

def update_username(new_name):
    """
    Support the changing of admin username.
    """
    return