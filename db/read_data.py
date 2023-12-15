#!/usr/bin/env python
# ---------------------------------------------------------------------
# read_data.py
# ---------------------------------------------------------------------

"""
Contains SQL Alchemy implementation of read-only data queries.
Implemented in database_req.py.
"""

# ---------------------------------------------------------------------

import os
import sys
import sqlalchemy
import sqlalchemy.orm
import dotenv


"""Ugly but it's necessary for local testing to work."""
try:
    from . import database  # Try importing as part of a package
except ImportError:
    import database

dotenv.load_dotenv()
_DATABASE_URL = os.environ['DATABASE_URL']
_DATABASE_URL = _DATABASE_URL.replace('postgres://', 'postgresql://')

# echo = True for testing (writes to stdout each SQL statement)
_engine = sqlalchemy.create_engine(_DATABASE_URL, echo = False)

# ---------------------------------------------------------------------

# Corresponds to database_req.py's get_pins().
def get_pins_all(include_reviews=False):
    try:
        # try:
        with sqlalchemy.orm.Session(_engine) as session:
            
            query = (session.query(database.Hotspots,
                                    database.MapBox)
                    .filter(database.Hotspots.hotspot_id == database.MapBox.hotspot_id))
            
            if include_reviews:
                reviews = get_all_reviews()
            
            table = query.all()
            pins = {}
            for row in table:
                pin = {}
                id = row[0].hotspot_id
                pin['hotspot_id'] = id
                pin['name'] = row[0].location_name
                pin['address'] = row[0].address
                pin['latitude'] = row[1].latitude
                pin['longitude'] = row[1].longitude
                pin['ul_speed'] = row[0].upload_speed
                pin['dl_speed'] = row[0].download_speed
                pin['descrip'] = row[0].description

                tags = []
                tags_list = row[0].tags

                for tag in tags_list:
                    ref = {"tag_id" : tag.tag_id,
                            "tag_name" : tag.tag_name,
                            "category" : tag.category}
                    tags.append(ref)

                pin['tags'] = tags

                if include_reviews:
                    pin['ratings'] = []

                pins[id] = pin
            
            if include_reviews:
                for review in reviews:
                    id = review['hotspot_id']
                    rating = review['stars']

                    pins[id]['ratings'].append(rating)

            return list(pins.values())

        # finally:
        #     _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        raise database.DatabaseError("Database Error - Read")

# ---------------------------------------------------------------------

# Corresponds to database_req.py's get_reviews().
def get_single_review(hotspot_id: int):
    try:
        # try:
        with sqlalchemy.orm.Session(_engine) as session:
            
            query = (session.query(database.Reviews_Approved)
                    .filter(database.Reviews_Approved.hotspot_id == hotspot_id))
            
            table = query.all()
            reviews = []
            for row in table:
                reviews.append({
                    'hotspot_id': row.hotspot_id,
                    'stars': row.rating,
                    'text': row.comment,
                    'time': row.time})

            return reviews

        # finally:
        #     _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        raise database.DatabaseError("Database Error - Read")

# ---------------------------------------------------------------------

# Corresponds to database_req.py's get_reviews().
def get_all_reviews(just_ratings=False):
    try:
        # try:
        with sqlalchemy.orm.Session(_engine) as session:
            
            query = (session.query(database.Reviews_Approved))
            
            table = query.all()
            reviews = []
            for row in table:
                if just_ratings:
                    reviews.append({
                        'stars': row.rating,
                        'hotspot_id': row.hotspot_id
                    })
                else:
                    reviews.append({
                        'stars': row.rating,
                        'hotspot_id': row.hotspot_id,
                        'text': row.comment,
                        'time': row.time})

            return reviews

        # finally:
        #     _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        raise database.DatabaseError("Database Error - Read")

# ---------------------------------------------------------------------

# Corresponds to database_req.py's get_reviews().
def get_pending_reviews():
    try:
        # try:
        with sqlalchemy.orm.Session(_engine) as session:
            
            query = session.query(database.Reviews_Pending)
            # print(session.execute(query).all())
            
            table = query.all()
            reviews = []
            for row in table:
                reviews.append({
                    'hotspot_id': row.hotspot_id,
                    'review_id': row.review_id,
                    'stars': row.rating,
                    'text': row.comment,
                    'time': row.time})

            return reviews

        # finally:
        #     _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        raise database.DatabaseError("Database Error - Read")

# ---------------------------------------------------------------------

# Corresponds to database_req.py's get_tags_by_category().
def get_tags_category(cat: str = ""):
    try:
        # try:
        with sqlalchemy.orm.Session(_engine) as session:
            
            if cat:
                query = (session.query(database.Tags)
                        .filter(database.Tags.category == cat))
            else:   # cat empty string
                query = session.query(database.Tags)  
            
            table = query.all()
            tags = []
            for row in table:
                tags.append({
                    'tag_id': row.tag_id,
                    'tag_name': row.tag_name,
                    'category': row.category})

            return tags

        # finally:
        #     _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        raise database.DatabaseError("Database Error - Read")


# ---------------------------------------------------------------------
def is_authorized_user(key: str = ""):
    try:
        # try:
        with sqlalchemy.orm.Session(_engine) as session:
        
            query = (session.query(database.Admin)
                    .filter(database.Admin.admin_key == key))
            
            result = query.one_or_none()  # Fetch one result or None if no match is found
            return result is not None

        # finally:
        #     _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        raise database.DatabaseError("Database Error - Read")
# ---------------------------------------------------------------------
def get_all_admin():
    try:
        # try:
        with sqlalchemy.orm.Session(_engine) as session:
            
            query = session.query(database.Admin)
            # print(session.execute(query).all())
            
            table = query.all()
            admins = []
            for row in table:
                admins.append({
                    'admin_id': row.admin_id,
                    'admin_key': row.admin_key})

            return admins

        # finally:
        #     _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        raise database.DatabaseError("Database Error - Read")
# ---------------------------------------------------------------------

def main():

    pins = get_pins_all()

    for pin in pins:
        print(pin)

    print(get_single_review(1))

    # Tags
    print(get_tags_category())
    print(get_tags_category("Cost"))
    print(get_tags_category("cost"))    # should be nothing
    print(get_tags_category("Privacy"))
    print(get_tags_category("Password"))
    print(get_tags_category("Amenities"))
    print(get_tags_category("Type_Establishment"))
    print(get_tags_category("Accessibility"))

    print(is_authorized_user("cos333pcw@gmail.com"))
    print(get_pins_all())
    print(get_all_admin())

if __name__ == '__main__':
    main()
