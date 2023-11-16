#!/usr/bin/env python
# ---------------------------------------------------------------------
# write_data.py
# ---------------------------------------------------------------------

"""
Contains SQL Alchemy implementation of write data queries.
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
    from .read_data import _engine
    from . import database as db # Try importing as part of a package
except ImportError:
    import database as db
    from read_data import _engine

# ---------------------------------------------------------------------

# Uses SERIAL & SEQUENCE to implement id attribution. Maxes out at 2
# billion. Shouldn't be a problem for now, but could be in the future!!
# Will throw error once it maxes out.
def add_user_review_imp(hotspot_id, rating, comment, time):

    try: 
        with sqlalchemy.orm.Session(_engine) as session:
            insert = db.Reviews_Pending(hotspot_id = hotspot_id,
                                     rating = rating, comment = comment,
                                     time = time)
            
            session.add(insert)
            session.commit()
    except Exception as ex: 
        session.rollback()
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
    finally:
          _engine.dispose()

# ---------------------------------------------------------------------

# TODO: shit looks hard rn b/c need to take away all traces
def remove_hotspots(list):
     return


# ---------------------------------------------------------------------

# Accomplish both hide and reveal operations for hotspots. "hide" is
# boolean to hide or reveal.
def visualization_hotspots(list, hide):
     try:
          with sqlalchemy.orm.Session(_engine) as session:
               
               hide = {"hidden" : True} if hide else {"hidden" : False}
               stmt = sqlalchemy.update(db.MapBox).values(hide).where(db.MapBox.hotspot_id.in_(list))
               session.execute(stmt)
               session.commit()
     except Exception as ex:
          session.rollback()
          print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
     finally:
          _engine.dispose()


# ---------------------------------------------------------------------

# TODO: incorporate updated_by and last_updated.
def update_hotspots_imp(hotspots):
     try:
          with sqlalchemy.orm.Session(_engine) as session:
               
               for hotspot in hotspots:
                    id = hotspot["hotspot_id"]
                    # hotspots table
                    hotspots_info = {"hotspot_id": hotspot["hotspot_id"],
                                   "location_name": hotspot["location_name"],
                                   "address": hotspot["address"],
                                   "upload_speed": hotspot["upload_speed"],
                                   "download_speed": hotspot["download_speed"],
                                   "description": hotspot["description"]}

                    stmt = sqlalchemy.update(db.Hotspots).values(hotspots_info).where(db.Hotspots.hotspot_id == id)
                    session.execute(stmt)

                    # mapbox_specific table
                    mapbox_info = {"hotspot_id": hotspot["hotspot_id"],
                                   "longitude" : hotspot["longitude"],
                                   "latitude" : hotspot["latitude"]}
                    
                    stmt = sqlalchemy.update(db.MapBox).values(mapbox_info).where(db.MapBox.hotspot_id == id)
                    session.execute(stmt)         
               
               session.commit()
     except Exception as ex:
          session.rollback()
          print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
     finally:
          _engine.dispose()


# ---------------------------------------------------------------------

def main():
     # visualization_hotspots([23], False)
    #  to_update = [{
    #       "hotspot_id": 23,
    #       "location_name": "no tag place",
    #       "address": "234 Palace Place",
    #       "latitude": "	39.952583",
    #       "longitude": "-75.165222",
    #       "upload_speed": "234",
    #       "download_speed": "19",
    #       "description": "new description bois"
    #  }]
    #  update_hotspots_imp(to_update)
    return

# ---------------------------------------------------------------------

if __name__ == "__main__":
     main()