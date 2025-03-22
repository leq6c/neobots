import os

import psycopg2
from psycopg2 import sql
from psycopg2.pool import ThreadedConnectionPool

DB_CONNECTION = os.getenv("DB_CONNECTION")
TABLE_NAME = "data_store_0"


class DBPostgres:
    def __init__(self):
        self.connection = None

    def init_db(self):
        self.pool = ThreadedConnectionPool(
            1, 10, dsn=DB_CONNECTION  # minconn  # maxconn
        )

        conn = self.pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    sql.SQL(
                        f"create table if not exists {TABLE_NAME} (data_key varchar(255) primary key, data_value text);"
                    )
                )
            conn.commit()
        finally:
            self.pool.putconn(conn)

    def put(self, key, value):
        conn = self.pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    f"INSERT INTO {TABLE_NAME} (data_key, data_value) VALUES (%s, %s)",
                    (key, value),
                )
            conn.commit()
        finally:
            self.pool.putconn(conn)

    def get(self, key):
        conn = self.pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    f"SELECT data_value FROM {TABLE_NAME} WHERE data_key = %s", (key,)
                )
                row = cursor.fetchone()
                if row is None:
                    return None
                return row[0]
        finally:
            self.pool.putconn(conn)
