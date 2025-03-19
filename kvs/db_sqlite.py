import sqlite3

class DBSqlite:
    def init_db(self):
        conn = sqlite3.connect("kvs.db")
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS kvs (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)
        conn.commit()
        conn.close()

    def put(self, key, value):
        conn = sqlite3.connect("kvs.db")
        c = conn.cursor()
        c.execute("INSERT INTO kvs (key, value) VALUES (?, ?)", (key, value))
        conn.commit()
        conn.close()

    def get(self, key):
        conn = sqlite3.connect("kvs.db")
        c = conn.cursor()
        c.execute("SELECT value FROM kvs WHERE key = ?", (key,))
        row = c.fetchone()
        conn.close()

        if row is None:
            return None

        return row[0]
