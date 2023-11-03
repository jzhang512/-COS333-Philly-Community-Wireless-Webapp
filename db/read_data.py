#!/usr/bin/env python
# ---------------------------------------------------------------------
# read_data.py
# ---------------------------------------------------------------------

"""
Contains SQL Alchemy implementation of read-only data queries.
Implemented in database.py.
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
                        .filter(database.Hotspots.unique_id == database.MapBox.unique_id))
                
                table = query.all()
                pins = []
                for row in table:
                    pin = {}
                    pin['unique_id'] = row[0].unique_id
                    pin['name'] = row[0].location_name
                    pin['address'] = row[0].address
                    pin['latitude'] = row[1].latitude
                    pin['longitude'] = row[1].longitude
                    pin['ul_speed'] = row[0].upload_speed
                    pin['dl_speed'] = row[0].download_speed
                    pin['descrip'] = row[0].description

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
                        .filter(database.Reviews_Approved.unique_id == pin_id))
                
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

def main():
    print(get_pins_all())
    print(get_single_review(1))

if __name__ == '__main__':
    main()
