import os
import psycopg2
from psycopg2 import sql

DB_CONNECTION = os.getenv("DB_CONNECTION")

class DBPostgres:
    def __init__(self):
        self.connection = None

    def init_db(self):
        self.connection = psycopg2.connect(DB_CONNECTION)
        with self.connection.cursor() as cursor:
            cursor.execute(
                sql.SQL(
                    "create table if not exists data_store (data_key varchar(255) primary key, data_value text);"
                )
            )

    def put(self, key, value):
        with self.connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO data_store (data_key, data_value) VALUES (%s, %s)", (key, value)
            )

    def get(self, key):
        with self.connection.cursor() as cursor:
            cursor.execute("SELECT data_value FROM data_store WHERE data_key = %s", (key,))
            row = self.cursor.fetchone()
            if row is None:
                return None
            return row[0]
