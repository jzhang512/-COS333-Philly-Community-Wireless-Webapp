import os
import queue

import psycopg2


_DB_URL = os.environ['PCW_DB_URL']


_connection_pool = queue.Queue()


def get_conn():
    try:
        conn = _connection_pool.get(block=False)
    except queue.Empty:
        conn = psycopg2.connect(_DB_URL)
    return conn


def put_conn(conn):
    _connection_pool.put(conn)


def main():
    """For Testing"""
    
    conn = get_conn()
    try:
        with conn.cursor() as cursor:
            stmt = "select * from hotspots"
            cursor.execute(stmt)
            table = cursor.fetchall()
            for row in table:
                print(row)
    finally:
        put_conn(conn)


if __name__ == "__main__":
    main()
