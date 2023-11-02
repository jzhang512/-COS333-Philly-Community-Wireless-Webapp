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

Base = sqlalchemy.ext.declarative.declarative_base()

class MapBox (Base):
    __tablename__ = "mapbox_specific"

    unique_id = sqlalchemy.Column(sqlalchemy.Integer,
                                  primary_key = True)
    longitude = sqlalchemy.Column(sqlalchemy.Float)
    latitude = sqlalchemy.Column(sqlalchemy.Float)

# ----------------------------------

class Hotspots (Base):
    __tablename__ = "hotspots"

    unique_id = sqlalchemy.Column(sqlalchemy.Integer,
                                  primary_key = True)
    location_name = sqlalchemy.Column(sqlalchemy.String)
    upload_speed = sqlalchemy.Column(sqlalchemy.REAL)
    download_speed = sqlalchemy.Column(sqlalchemy.REAL)
    last_updated = sqlalchemy.Column(sqlalchemy.String)
    updated_by = sqlalchemy.Column(sqlalchemy.Integer)
    description = sqlalchemy.Column(sqlalchemy.String)

# ----------------------------------

class Hotspots_Tags (Base):
    __tablename__ = "hotspots_tags"

    unique_id = sqlalchemy.Column(sqlalchemy.Integer,
                                  primary_key = True)
    tag_id = sqlalchemy.Column(sqlalchemy.Integer,
                               primary_key = True)
    
# ----------------------------------
    
class Tags (Base):
    __tablename__ = "tags"

    tag_id = sqlalchemy.Column(sqlalchemy.Integer,
                               primary_key = True)
    tag_name = sqlalchemy.Column(sqlalchemy.String)
    category = sqlalchemy.Column(sqlalchemy.String)
    added_by = sqlalchemy.Column(sqlalchemy.Integer)

# ----------------------------------

class Reviews_Approved (Base):
    __tablename__ = "reviews_approved"

    unique_id = sqlalchemy.Column(sqlalchemy.Integer,
                                  primary_key = True)
    rating = sqlalchemy.Column(sqlalchemy.Integer)
    comment = sqlalchemy.Column(sqlalchemy.String)
    time = sqlalchemy.Column(sqlalchemy.String)
    approved_by = sqlalchemy.Column(sqlalchemy.Integer)

# ----------------------------------

class Reviews_Pending (Base):
    __tablename__ = "reviews_pending"

    unique_id = sqlalchemy.Column(sqlalchemy.Integer,
                                  primary_key = True)
    rating = sqlalchemy.Column(sqlalchemy.Integer)
    comment = sqlalchemy.Column(sqlalchemy.String)
    time = sqlalchemy.Column(sqlalchemy.String)

# ----------------------------------

class Admin (Base):
    __tablename__ = "admin"

    admin_id = sqlalchemy.Column(sqlalchemy.Integer,
                                 primary_key = True)
    last_online = sqlalchemy.Column(sqlalchemy.String)
    admin_key = sqlalchemy.Column(sqlalchemy.String)    # validation
