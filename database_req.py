# ---------------------------------------------------------------------
# database_req.py
# ---------------------------------------------------------------------

"""
Contains complete database API used by server. All implementation 
should be in db package.
"""

# ---------------------------------------------------------------------

import db.read_data
import db.write_data
import db.validate

# ---------------------------------------------------------------------

InvalidFormat = db.validate.InvalidFormat

# ---------------------------------------------------------------------
# Read-Only Functions (public user).

def get_pins():
    """
    Should return a list of all pins (each pin represented as a dictionary) 
    with relevant information.
    
    A pin should have the following fields:
    {
        hotspot_id: int
        name: string
        address: string
        latitude: float
        longitude: float
        ul_speed: float (>0)
        dl_speed: float (>0)
        descrip: string
        tags: list of dicts (see get_tags for tag fields)
    }
    """
    
    return db.read_data.get_pins_all()

# ----------------------------------

def get_tags_by_category(category: str = ""):
    """
    Returns a list of tags (each tag is represented as pin). If category is
    empty, returns all tags, otherwise returns only tags that match the given
    category.

    A tag should have the following fields:
    {
        tag_id: int
        tag_name: string
        category: string
    }

    Valid categories are (we can add more as necessary):
        'cost',
        'privacy' (maybe rename to accessibility?),
        'establishment',
        'accessibility'
    """

    return db.read_data.get_tags_category(category)

# ----------------------------------

def get_reviews_by_hotspot(pin_id: int):
    """
    Returns a list of of reviews associated with pin with given pin_id. Each
    pin is represented as a dict.

    A review should have the following fields:
    {
        pin_id: int
        text: string
        stars: int (1-5)
        time: string ('YYYY-MM-DD HH:MM:SS')
    }
    """

    return db.read_data.get_single_review(pin_id)

# ----------------------------------

def get_pending_reviews():
    """
    Returns a list of unapproved reviews. Each review is represented as a dict.

    A review should have the following fields:
    {
        pin_id: int
        review_id: int
        text: string
        stars: int (1-5)
        time: string ('YYYY-MM-DD HH:MM:SS')
    }
    """
    
    return db.read_data.get_pending_reviews()

# ---------------------------------------------------------------------
# Write Functions (mostly admin use exception being user-left review).

def add_user_review(review):
    """
    Adds a user left review to the pending table.

    hotspot_id: int
    rating: int (1-5)
    text: string
    time: timestamp (need to verify valid format)
    """

    """Validate data"""
    db.validate.check_fields(review, "review", 
                             ['hotspot_id', 'rating', 'text', 'time'])
    hotspot_id = review['hotspot_id']
    rating = review['rating']
    comment = review['text']
    time = review['time']
    db.validate.validate_int(hotspot_id, "hotspot_id")
    db.validate.validate_int(rating, "rating", range=(1, 5))
    db.validate.validate_str(comment, "comment")
    # TODO: validate timestamp
    
    db.write_data.add_user_review_imp(hotspot_id, rating,
                                             comment, time)

    return # nothing to return
# ----------------------------------

def remove_hotspots(remove_list):
    """
    Removes hotspots specified by list (via hotspot_id) from the
    database. Does nothing for hotspots that don't exist or given empty
    list.

    remove_list: list of ints
    """
    
    # TODO validate format of data

    db.write_data.remove_hotspots(remove_list)

    return  # nothing to return

# ----------------------------------

def hide_hotspots(hide_list):
    """
    Hides hotspots specified by list on map and database. Alternative
    to removing hotspot data (still want to keep the data but not show
    it).

    hide_list: list of ints
    """

    # TODO validate format of data

    db.write_data.visualization_hotspots(hide_list, True)

    return  # nothing to return 

# ----------------------------------

def reveal_hotspots(reveal_list):
    """
    Reveals hidden hotspots specified by list on map and database.

    reveal_list: list of ints
    """

    # TODO validate format of data

    db.write_data.visualization_hotspots(reveal_list, False)

    return  # nothing to return

# ----------------------------------

def update_hotspots(hotspots):
    """
    Updates the corresponding hotspots' data. hotspots is a list of dicts. Each
    dict MUST contain all required fields. Tags are NOT updated, use 
    update_hotspot_tags instead.
    
    A hotspot should contain the following fields:
    {
        hotspot_id: int
        location_name: string
        address: string
        latitude: float
        longitude: float
        upload_speed: real
        download_speed: real
        description: string
    }
    """

    # TODO validate format of data
    db.write_data.update_hotspots_imp(hotspots)

    return 

# ----------------------------------

def create_hotspots(hotspots):
    """
    Create new hotspots. hotspots should be a list of dicts. Each hotspot should
    have the following fields. Hotspot_id should NOT be provided as it is 
    autogenerated. Tags should be a list of tag_id's.
    
    A hotspot should contain the following fields:
    {
        location_name: string
        address: string
        latitude: float
        longitude: float
        upload_speed: real
        download_speed: real
        description: string
        tags: list of ints
    }
    """

    # TODO validate format of data for floats
    fields = ['name', 'address', 'latitude', 'longitude', 'ul_speed', 
              'dl_speed', 'descrip', 'tags']
    db.validate.validate_list(hotspots)
    for hotspot in hotspots:
        db.validate.check_fields(hotspot, "dict", fields)
        db.validate.validate_str(hotspot['name'])
        db.validate.validate_str(hotspot['address'])
        db.validate.validate_str(hotspot['descrip'])
        db.validate.validate_list_ints(hotspots['tags'])

    db.write_data.create_hotspots_imp(hotspots)

    return # nothing to return

# ----------------------------------

def update_hotspot_tags(hotspots_and_tags):
    """
    Updates the corresponding hotspots' tags. hotspot_tags is a list of dicts. 
    Each dict MUST contain a hotspot_id and a list of tag_id's.
    
    A hotspot should have the following fields:
    {
        hotspot_id: int (REQUIRED)
        tags: list of ints
    }
    """

    # TODO validate format of data
    db.write_data.update_hotspots_tags(hotspots_and_tags)

    return # returns nothing

# ----------------------------------

# TODO will likely need to add to function here, admin_id of person
# who added these new tags
def add_tags(tags_to_add):
    """
    Add new tags to classify hotspots. tags_to_add is a list of dicts. 
    Do not provide tag_id.

    A tag should have the following fields:
    {
        tag_name: string
        category: string
    }

    Valid/current categories are (we can add more as necessary):
        'Cost',
        'Privacy',
        'Establishment',
        'Amenities'
        'Accessibility',
        'Password'
    """

    # TODO validate format of data

    db.write_data.add_new_tags(tags_to_add)

    return  # nothing to return

# ----------------------------------

def delete_tags(tag_ids):
    """
    Delete tags and removes them from any hotspot. tag_ids is a list of 
    tag_id's.

    tag_ids: list of ints
    """

    # TODO validate format of data

    db.write_data.delete_existing_tags(tag_ids)

    return  # nothing to return

# ----------------------------------

def update_tags(tags):
    """
    Update the given tags' details. Does not assign tags to hotspots
    (this is done in update_hotspot_tags()). tag_ids is a list of dicts.
    Cannot change tag_id.

    A tag should have the following fields:
    {
        tag_id: int
        tag_name: string
        category: string
    }

    Valid/current categories are (we can add more as necessary):
        'Cost',
        'Privacy',
        'Establishment',
        'Amenities'
        'Accessibility',
        'Password'
    """

    # TODO validate format of data

    db.write_data.update_tags_imp(tags)

    return

# ----------------------------------

def approve_review(review_id):
    """
    Approve the pending review. Review will move to the reviews_approved table.

    review_id: int
    """

    db.validate.validate_int(review_id, "review_id")

    db.write_data.approve_review(review_id)

    return  # returns nothing

# ----------------------------------

def reject_review(review_id):
    """
    Reject the pending review. Review will be deleted.

    review_id: int
    """

    db.validate.validate_int(review_id, "review_id")
    
    db.write_data.delete_pending_review(review_id)

    return

# ---------------------------------------------------------------------
# Admin Logistical Functions.

# Removed the create username function. Perhaps it should only be 
# update (it handle both cases, no need to delinate between the two?
# We'll need an admin_id either way.
def update_admin_username(admin_id, username):
    """
    Updates the username supplied by admin for own account.

    admin_id: int
    username: string (check for valid format)
    """

    # TODO validate format of data

    db.write_data.update_admin_username(admin_id, username)

    return

# ----------------------------------

def check_authorized_user(admin_id):
    """
    Updates the username supplied by admin for own account.

    admin_id: int
    username: string (check for valid format)
    """

    # TODO validate format of data

    db.write_data.update_admin_username(admin_id)

    return
# ----------------------------------

def main():
    pending_reviews = get_pending_reviews()

    for review in pending_reviews:
        print(review)


if __name__ == "__main__":
    main()