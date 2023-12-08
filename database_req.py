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

def get_pins(include_reviews=False):
    """
    Should return a list of all pins (each pin represented as a dictionary) 
    with relevant information.
    
    A pin should have the following fields:
    {
        hotspot_id: int
        ratings: list of ints
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
    
    return db.read_data.get_pins_all(include_reviews=include_reviews)

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
    db.validate.validate_str(category, "category")

    return db.read_data.get_tags_category(category)

# ----------------------------------

def get_reviews_by_hotspot(hotspot_id: int):
    """
    Returns a list of of reviews associated with pin with given pin_id. Each
    review is represented as a dict.

    A review should have the following fields:
    {
        hotspot_id: int
        text: string
        stars: int (1-5)
        time: string ('YYYY-MM-DD HH:MM:SS')
    }
    """
    hotspot_id = db.validate.validate_int(hotspot_id, "hotspot_id")

    return db.read_data.get_single_review(hotspot_id)

# ----------------------------------

def get_all_reviews(just_ratings=False):
    """
    Returns a list of reviews. Each review is represented as a dict.

    A review should have the following fields:
    {
        hotspot_id: int
        text: string
        stars: int (1-5)
        time: string ('YYYY-MM-DD HH:MM:SS')
    }
    """

    return db.read_data.get_all_reviews(just_ratings=just_ratings)

# ----------------------------------

def get_pending_reviews():
    """
    Returns a list of unapproved reviews. Each review is represented as a dict.

    A review should have the following fields:
    {
        hotspot_id: int
        TODO name: string
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
    text: string (length <= 200)
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
    db.validate.validate_str(comment, "comment", max_length=200)
    db.validate.validate_date(time, "date")
    
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
    
    remove_list = db.validate.validate_list_ints(remove_list, "hotspot ids")

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

    hide_list = db.validate.validate_list_ints(hide_list, "hotspot ids")

    db.write_data.visualization_hotspots(hide_list, True)

    return  # nothing to return 

# ----------------------------------

def reveal_hotspots(reveal_list):
    """
    Reveals hidden hotspots specified by list on map and database.

    reveal_list: list of ints
    """

    reveal_list = db.validate.validate_list_ints(reveal_list, "hotspot ids")

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
        location_name: string (length <= 80)
        address: string (length <= 150)
        latitude: float
        longitude: float
        upload_speed: real
        download_speed: real
        description: string (length <= 300)
    }
    """

    fields = ["hotspot_id", "location_name", "address", "latitude", "longitude",
              "upload_speed", "download_speed", "description"]
    db.validate.validate_list(hotspots, "hotspots")
    for i, hotspot in enumerate(hotspots):
        db.validate.check_fields(hotspot, "dict", fields)
        hotspot["hotspot_id"] = db.validate.validate_int(hotspot["hotspot_id"], 'hotspot id')
        db.validate.validate_str(hotspot['location_name'], "location name", max_length=80)
        db.validate.validate_str(hotspot['address'], "address", max_length=150)
        db.validate.validate_str(hotspot['description'], "description", max_length=300)
        hotspot['latitude'] = db.validate.validate_float(hotspot['latitude'], 'latitude', range=(-90, 90))
        hotspot['longitude'] = db.validate.validate_float(hotspot['longitude'], 'longitude', range=(-180, 180))
        hotspot['upload_speed'] = db.validate.validate_float(hotspot['upload_speed'], 'upload_speed')
        hotspot['download_speed'] = db.validate.validate_float(hotspot['download_speed'], 'download_speed')
        hotspots[i] = hotspot
    
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
        upload_speed: float
        download_speed: float
        description: string
        tags: list of ints
    }
    """

    fields = ['location_name', 'address', 'latitude', 'longitude', 
              'upload_speed', 'download_speed', 'description', 'tags']
    db.validate.validate_list(hotspots, "hotspots")
    for i, hotspot in enumerate(hotspots):
        db.validate.check_fields(hotspot, "dict", fields)
        db.validate.validate_str(hotspot['location_name'], "location name")
        db.validate.validate_str(hotspot['address'], "address")
        db.validate.validate_str(hotspot['description'], "description")
        hotspot['latitude'] = db.validate.validate_float(hotspot['latitude'], 'latitude', range=(-90, 90))
        hotspot['longitude'] = db.validate.validate_float(hotspot['longitude'], 'longitude', range=(-180, 180))
        hotspot['upload_speed'] = db.validate.validate_float(hotspot['upload_speed'], 'upload_speed')
        hotspot['download_speed'] = db.validate.validate_float(hotspot['download_speed'], 'download_speed')
        hotspot['tags'] = db.validate.validate_list_ints(hotspot['tags'], "tags")
        hotspots[i] = hotspot

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

    fields = ['location_name', 'tags']
    db.validate.validate_list(hotspots_and_tags, "hotspots")
    for i, hotspot in enumerate(hotspots_and_tags):
        db.validate.check_fields(hotspot, "dict", fields)
        hotspot['tags'] = db.validate.validate_list_ints(hotspot['tags'], "tags")
        hotspots_and_tags[i] = hotspot

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
        tag_name: string (length <= 30)
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

    fields = ["tag_name", "category"]
    categories = ['Cost', 'Privacy', 'Establishment', 'Amenities',
                  'Accessibility', 'Password']
    db.validate.validate_list(tags_to_add, "tags")
    for tag in tags_to_add:
        db.validate.check_fields(tag, "tag", fields)
        db.validate.validate_str(tag['tag_name'], "tag name", max_length=30)
        db.validate.validate_str(tag['category'], "category", possible_vals=categories)

    db.write_data.add_new_tags(tags_to_add)

    return  # nothing to return

# ----------------------------------

def delete_tags(tag_ids):
    """
    Delete tags and removes them from any hotspot. tag_ids is a list of 
    tag_id's.

    tag_ids: list of ints
    """

    tag_ids = db.validate.validate_list_ints(tag_ids, "tag ids")
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

    fields = ["tag_id", "tag_name", "category"]
    categories = ['Cost', 'Privacy', 'Establishment', 'Amenities',
                  'Accessibility', 'Password']
    db.validate.validate_list(tags, "tags")
    for i, tag in enumerate(tags):
        db.validate.check_fields(tag, "tag", fields)
        tag["tag_id"] = db.validate.validate_int(tag["tag_id"], "tag id")
        db.validate.validate_str(tag['tag_name'], "tag name", max_length=30)
        db.validate.validate_str(tag['category'], "category", possible_vals=categories)

    db.write_data.update_tags_imp(tags)

    return

# ----------------------------------

def approve_review(review_id):
    """
    Approve the pending review. Review will move to the reviews_approved table.

    review_id: int
    """

    review_id = db.validate.validate_int(review_id, "review_id")

    db.write_data.approve_review(review_id)

    return  # returns nothing

# ----------------------------------

def reject_review(review_id):
    """
    Reject the pending review. Review will be deleted.

    review_id: int
    """

    review_id = db.validate.validate_int(review_id, "review_id")
    
    db.write_data.delete_pending_review(review_id)

    return

# ---------------------------------------------------------------------
# Admin Logistical Functions.

# Removed the create username function. Perhaps it should only be 
# update (it handle both cases, no need to delinate between the two?
# We'll need an admin_id either way.

def is_authorized_user(key: str = ""):
    """
    """

    db.validate.validate_str(key, "key")

    return db.read_data.is_authorized_user(key)

# ---------------------------------------------------------------------
    
def add_new_admin(key: str = ""):
    """
    """

    db.validate.validate_str(key, "key")

    return db.write_data.add_new_admin(key)

# ---------------------------------------------------------------------

def get_all_admin():
    """
    """

    # TODO validate format of data

    return db.read_data.get_all_admin()
# ----------------------------------
def delete_selected_admin(admins):
    """
    """
    # TODO validate format of data

    return db.write_data.remove_admins(admins)
# ----------------------------------
# ---------------------------------------------------------------------
def main():

    add_new_admin("admin@gmail.com")

    # print(is_authorized_user("cos333pcw@gmail.com"))

    # pending_reviews = get_pending_reviews()

    # for review in pending_reviews:
    #     print(review)


if __name__ == "__main__":
    main()