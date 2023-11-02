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
import database

dotenv.load_dotenv()
DATABASE_URL = os.environ['postgres://bltnirbj:VrUT9KZ3GeD-6DqxmBDyvTiLfHilj0q8@suleiman.db.elephantsql.com/bltnirbj']

# ---------------------------------------------------------------------




