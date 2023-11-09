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
def get_pins_all():
    try:
        try:
            with sqlalchemy.orm.Session(_engine) as session:
                
                query = (session.query(database.Hotspots,
                                       database.MapBox)
                        .filter(database.Hotspots.hotspot_id == database.MapBox.hotspot_id))
                
                table = query.all()
                pins = []
                for row in table:
                    pin = {}
                    pin['hotspot_id'] = row[0].hotspot_id
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

                    pins.append(pin)

                return pins

        finally:
            _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        sys.exit(1)

# ---------------------------------------------------------------------

# Corresponds to database_req.py's get_reviews().
def get_single_review(pin_id: int):
    try:
        try:
            with sqlalchemy.orm.Session(_engine) as session:
                
                query = (session.query(database.Reviews_Approved)
                        .filter(database.Reviews_Approved.hotspot_id == pin_id))
                
                table = query.all()
                reviews = []
                for row in table:
                    reviews.append({
                        'stars': row.rating,
                        'text': row.comment,
                        'time': row.time})

                return reviews

        finally:
            _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        sys.exit(1)

# ---------------------------------------------------------------------

# Corresponds to database_req.py's get_reviews().
def get_pending_reviews():
    try:
        try:
            with sqlalchemy.orm.Session(_engine) as session:
                
                query = (session.query(database.Reviews_Pending))
                
                table = query.all()
                reviews = []
                for row in table:
                    reviews.append({
                        'pin_id': row.hotspot_id,
                        'review_id': row.review_id,
                        'stars': row.rating,
                        'text': row.comment,
                        'time': row.time})

                return reviews

        finally:
            _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        sys.exit(1)

# ---------------------------------------------------------------------

# Corresponds to database_req.py's get_tags_by_category().
def get_tags_category(cat: str = ""):
    try:
        try:
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

        finally:
            _engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        sys.exit(1)


# ---------------------------------------------------------------------

def main():
    print(get_pins_all())
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

if __name__ == '__main__':
    main()
