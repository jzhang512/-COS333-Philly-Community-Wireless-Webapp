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

                    stmt = sqlalchemy.insert(db.Hotspots).values(hotspots_info)
                    session.execute(stmt)

                    # mapbox_specific table
                    mapbox_info = {"hotspot_id": hotspot["hotspot_id"],
                                   "longitude" : hotspot["longitude"],
                                   "latitude" : hotspot["latitude"]}
                    
                    stmt = sqlalchemy.insert(db.MapBox).values(mapbox_info)
                    session.execute(stmt)         
               
               session.commit()
     except Exception as ex:
          session.rollback()
          print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
     finally:
          _engine.dispose()


# ---------------------------------------------------------------------

def create_hotspots_imp(hotspots_to_create):
     try:
          with sqlalchemy.orm.Session(_engine) as session:
               
               for hotspot in hotspots_to_create:
                  
                    # hotspots table
                    hotspots_info = {"location_name": hotspot["location_name"],
                                   "address": hotspot["address"],
                                   "upload_speed": hotspot["upload_speed"],
                                   "download_speed": hotspot["download_speed"],
                                   "description": hotspot["description"]}

                    stmt = sqlalchemy.insert(db.Hotspots).values(hotspots_info)
                    result = session.execute(stmt)

                    generated_id = result.inserted_primary_key[0]

                    # mapbox_specific table
                    mapbox_info = {"hotspot_id": generated_id,
                                   "longitude" : hotspot["longitude"],
                                   "latitude" : hotspot["latitude"]}
                    
                    stmt = sqlalchemy.insert(db.MapBox).values(mapbox_info)
                    session.execute(stmt)

                    # assumes that the tags given are valid and are int
                    for tag in hotspot["tags"]:
                         insert = {"hotspot_id": generated_id, "tag_id": tag}

                         stmt = sqlalchemy.insert(db.hotspots_tags_many).values(insert)
                         session.execute(stmt)

               session.commit()
     except Exception as ex:
          session.rollback()
          print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
     finally:
         _engine.dispose()

# ---------------------------------------------------------------------

def approve_review(review_id):
     try: 
        with sqlalchemy.orm.Session(_engine) as session:
          # Get from pending table.
          retrieve = (session.query(db.Reviews_Pending)
                     .filter(db.Reviews_Pending.review_id == review_id)).all()
          
          
          hotspot_id = retrieve[0].hotspot_id
          rating = retrieve[0].rating
          comment = retrieve[0].comment
          time = retrieve[0].time
           
           # Add to approved table.
          insert = db.Reviews_Approved(hotspot_id = hotspot_id,
                                     rating = rating, comment = comment,
                                     time = time, review_id = review_id)

          # Data transfer
          session.add(insert)
          session.delete(retrieve[0])   # Delete from pending table

          session.commit()
     except Exception as ex: 
        session.rollback()
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
     finally:
          _engine.dispose()

# ---------------------------------------------------------------------

def delete_pending_review(review_id):
     try: 
        with sqlalchemy.orm.Session(_engine) as session:
          # Get from pending table.
          retrieve = (session.query(db.Reviews_Pending)
                     .filter(db.Reviews_Pending.review_id == review_id)).all()
          
          session.delete(retrieve[0])   # Delete from pending table

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

#     to_add = [{
#           "location_name": "test add",
#           "address": "234 test",
#           "latitude": "	39.952583",
#           "longitude": "-75.165222",
#           "upload_speed": "234",
#           "download_speed": "19",
#           "description": "new description bois",
#           "tags": [2,10]
#      }]
    
#     create_hotspots_imp(to_add)

    return

# ---------------------------------------------------------------------

if __name__ == "__main__":
     main()