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
        raise Exception("Database Error - Write")
    finally:
          _engine.dispose()

# ---------------------------------------------------------------------

def remove_hotspots(remove_list):
    
    try: 
        with sqlalchemy.orm.Session(_engine) as session:
            
          for hotspot_id in remove_list:
               # Remove from hotspots table.
               stmt = sqlalchemy.delete(db.Hotspots).where(db.Hotspots.hotspot_id == hotspot_id)
               session.execute(stmt)

               # Remove from hotspots_tags table.
               stmt = sqlalchemy.delete(db.hotspots_tags_many).where(db.hotspots_tags_many.c.hotspot_id == hotspot_id)
               session.execute(stmt)

               # Remove from mapbox_specific table.
               stmt = sqlalchemy.delete(db.MapBox).where(db.MapBox.hotspot_id == hotspot_id)
               session.execute(stmt)

               # Remvoe from reviews_approved table.
               stmt = sqlalchemy.delete(db.Reviews_Approved).where(db.Reviews_Approved.hotspot_id == hotspot_id)
               session.execute(stmt)

               # Remove from reviews_pending table. 
               stmt = sqlalchemy.delete(db.Reviews_Pending).where(db.Reviews_Pending.hotspot_id == hotspot_id)
               session.execute(stmt)

          session.commit()
    except Exception as ex: 
        session.rollback()
        print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
        raise Exception("Database Error - Write")
    finally:
          _engine.dispose()
    

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
          raise Exception("Database Error - Write")
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
          raise Exception("Database Error - Write")
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
          raise Exception("Database Error - Write")
     finally:
         _engine.dispose()

# ---------------------------------------------------------------------

def update_hotspots_tags(hotspots_and_tags):
     try:
          with sqlalchemy.orm.Session(_engine) as session:
               
               # Possibly inefficient (removes all then adds all).
               # Assumes that hotspot_ids given are valid. TODO
               for hotspot in hotspots_and_tags:
                    hotspot_id = hotspot["hotspot_id"]
                    tags = hotspot["tags"]

                    stmt = sqlalchemy.delete(db.hotspots_tags_many).where(db.hotspots_tags_many.c.hotspot_id == hotspot_id)
                    session.execute(stmt)

                    # assumes that the tags given are valid and are int
                    for tag in tags:
                         insert = {"hotspot_id": hotspot_id, "tag_id": tag}

                         stmt = sqlalchemy.insert(db.hotspots_tags_many).values(insert)
                         session.execute(stmt)
               
               session.commit()
     except Exception as ex:
          session.rollback()
          print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
          raise Exception("Database Error - Write")
     finally:
         _engine.dispose()
        

# ---------------------------------------------------------------------

# TODO added_by based on the admin
def add_new_tags(tags_to_add):
    
     try:
          with sqlalchemy.orm.Session(_engine) as session:
                   
               for tag_detail in tags_to_add:

                    tag_name = tag_detail["tag_name"]
                    category = tag_detail["category"]

                    new_tag = {"tag_name": tag_name,
                               "category": category}
                    
                    stmt = sqlalchemy.insert(db.Tags).values(new_tag)
                    session.execute(stmt)
    
               session.commit()
     except Exception as ex:
          session.rollback()
          print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
          raise Exception("Database Error - Write")
     finally:
         _engine.dispose()


# ---------------------------------------------------------------------

def delete_existing_tags(tag_id_list):

     try:
          with sqlalchemy.orm.Session(_engine) as session:
                   
               for tag_id in tag_id_list:
                    
                    stmt = sqlalchemy.delete(db.Tags).where(db.Tags.tag_id == tag_id)
                    session.execute(stmt)
    
               session.commit()
     except Exception as ex:
          session.rollback()
          print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
          raise Exception("Database Error - Write")
     finally:
         _engine.dispose()

# ---------------------------------------------------------------------

def update_tags_imp(tags_to_update):

     try:
          with sqlalchemy.orm.Session(_engine) as session:
                   
               for tag_dict in tags_to_update:
                    tag_id = tag_dict["tag_id"]

                    updated_info = {"tag_name": tag_dict["tag_name"],
                                    "category": tag_dict["category"]}

                    stmt = sqlalchemy.update(db.Tags).values(updated_info).where(db.Tags.tag_id == tag_id)
                    session.execute(stmt)
    
               session.commit()
     except Exception as ex:
          session.rollback()
          print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
          raise Exception("Database Error - Write")
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
        raise Exception("Database Error - Write")
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
        raise Exception("Database Error - Write")
     finally:
          _engine.dispose()

# ---------------------------------------------------------------------

def update_admin_username(admin_id, username):

     try:
          with sqlalchemy.orm.Session(_engine) as session:

               update = {"admin_username":username}
                   
               stmt = sqlalchemy.update(db.Admin).values(update).where(db.Admin.admin_id == admin_id)
               session.execute(stmt)

               session.commit()
     except Exception as ex:
          session.rollback()
          print(str(sys.argv[0]) + ": " + str(ex), file = sys.stderr)
          raise Exception("Database Error - Write")
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

     # remove_hotspots([96])

     # update_hotspots_tags([{"hotspot_id": 43, "tags": [1,9]}])

     # add_new_tags([{"tag_name":"test_tag", "category": "testCat"}])

     # delete_existing_tags([18])

     # update_tags_imp([{"tag_id":18, "tag_name":"testtest","category":"cat"}])

     # update_admin_username(87, "Jahhhmeezz")

     return

# ---------------------------------------------------------------------

if __name__ == "__main__":
     main()