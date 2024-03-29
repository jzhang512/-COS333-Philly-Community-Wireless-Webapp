#!/usr/bin/env python
# ---------------------------------------------------------------------
# database.py
# ---------------------------------------------------------------------

"""
Contains database schema as set up in ElephantSQL.
"""
# ---------------------------------------------------------------------

import sqlalchemy.ext.declarative
import sqlalchemy

# ---------------------------------------------------------------------

class DatabaseError(Exception):
    def __init__(self, string):
        self.error = string
    
    def __str__(self):
        return self.error

# ---------------------------------------------------------------------

Base = sqlalchemy.ext.declarative.declarative_base()

class MapBox (Base):
    __tablename__ = "mapbox_specific"

    hotspot_id = sqlalchemy.Column(sqlalchemy.Integer, 
                                  primary_key = True)
    longitude = sqlalchemy.Column(sqlalchemy.Float)
    latitude = sqlalchemy.Column(sqlalchemy.Float)
    hidden = sqlalchemy.Column(sqlalchemy.Boolean)

# ----------------------------------

# class Hotspots_Tags (Base):
#     __tablename__ = "hotspots_tags"

#     hotspot_id = sqlalchemy.Column(sqlalchemy.Integer,
#                                   primary_key = True)
#     tag_id = sqlalchemy.Column(sqlalchemy.Integer,
#                                primary_key = True)
hotspots_tags_many = sqlalchemy.Table(
    "hotspots_tags",
    Base.metadata,
    sqlalchemy.Column("hotspot_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("hotspots.hotspot_id")),
    sqlalchemy.Column("tag_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("tags.tag_id"))
)

# ----------------------------------

class Hotspots (Base):
    __tablename__ = "hotspots"

    hotspot_id = sqlalchemy.Column(sqlalchemy.Integer, 
                                   sqlalchemy.Sequence("hotspot_id_seq",
                                                      start=30), 
                                  primary_key = True)
    location_name = sqlalchemy.Column(sqlalchemy.String)
    upload_speed = sqlalchemy.Column(sqlalchemy.REAL)
    download_speed = sqlalchemy.Column(sqlalchemy.REAL)
    last_updated = sqlalchemy.Column(sqlalchemy.String)
    updated_by = sqlalchemy.Column(sqlalchemy.Integer)
    description = sqlalchemy.Column(sqlalchemy.String)
    address = sqlalchemy.Column(sqlalchemy.String)

    tags = sqlalchemy.orm.relationship("Tags", secondary = hotspots_tags_many, back_populates = "hotspots")


# ----------------------------------
    
class Tags (Base):
    __tablename__ = "tags"

    tag_id = sqlalchemy.Column(sqlalchemy.Integer,
                                sqlalchemy.Sequence("tag_id_seq",
                                                      start=18),
                               primary_key = True)
    tag_name = sqlalchemy.Column(sqlalchemy.String)
    category = sqlalchemy.Column(sqlalchemy.String)
    added_by = sqlalchemy.Column(sqlalchemy.Integer)

    hotspots = sqlalchemy.orm.relationship("Hotspots", secondary = hotspots_tags_many, back_populates = "tags")

# ----------------------------------

class Reviews_Approved (Base):
    __tablename__ = "reviews_approved"

    hotspot_id = sqlalchemy.Column(sqlalchemy.Integer)
    rating = sqlalchemy.Column(sqlalchemy.Integer)
    comment = sqlalchemy.Column(sqlalchemy.String)
    time = sqlalchemy.Column(sqlalchemy.String)
    approved_by = sqlalchemy.Column(sqlalchemy.Integer)
    review_id = sqlalchemy.Column(sqlalchemy.Integer,
                                  primary_key = True)

# ----------------------------------

class Reviews_Pending (Base):
    __tablename__ = "reviews_pending"

    hotspot_id = sqlalchemy.Column(sqlalchemy.Integer)
    rating = sqlalchemy.Column(sqlalchemy.Integer)
    comment = sqlalchemy.Column(sqlalchemy.String)
    time = sqlalchemy.Column(sqlalchemy.String)
    review_id = sqlalchemy.Column(sqlalchemy.Integer,
                                  sqlalchemy.Sequence("review_id_seq",
                                                      start=1), 
                                                      primary_key = True)

# ----------------------------------

class Admin (Base):
    __tablename__ = "admin"

    admin_id = sqlalchemy.Column(sqlalchemy.Integer,
                                 sqlalchemy.Sequence("admin_id_seq",
                                                      start=7), 
                                 primary_key = True)
    admin_key = sqlalchemy.Column(sqlalchemy.String)    # validation
