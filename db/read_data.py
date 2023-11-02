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
import db.database

dotenv.load_dotenv()
_DATABASE_URL = os.environ['DATABASE_URL']
_DATABASE_URL = _DATABASE_URL.replace('postgres://', 'postgresql://')

# ---------------------------------------------------------------------

# Corresponds to data_req.py's get_pins().
def get_pins_all():
 
    try:
        # echo = True for testing (writes to stdout each SQL statement)
        engine = sqlalchemy.create_engine(_DATABASE_URL, echo = False)
        
        try:
            with sqlalchemy.orm.Session(engine) as session:
                
                query = (session.query(db.database.Hotspots,
                                       db.database.MapBox)
                        .filter(db.database.Hotspots.unique_id == db.database.MapBox.unique_id))
                
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
            engine.dispose()
  
    except Exception as ex:
        print(str(sys.argv[0]) + ": " + ex, file = sys.stderr)
        sys.exit(1)

# ---------------------------------------------------------------------

def main():
    print(get_pins_all())

if __name__ == '__main__':
    main()
