import sqlite3
import uuid
from flask import Flask, request, jsonify

app = Flask(__name__)

def init_db():
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

@app.route("/put", methods=["POST"])
def put():
    content = request.json.get("content")
    if content is None:
        return jsonify({"error": "Missing content"}), 400
    
    key = str(uuid.uuid4())[0:3] + "-" + str(uuid.uuid4())[0:3]
    conn = sqlite3.connect("kvs.db")
    c = conn.cursor()
    c.execute("INSERT INTO kvs (key, value) VALUES (?, ?)", (key, content))
    conn.commit()
    conn.close()
    
    return jsonify({"key": key})

@app.route("/get/<key>", methods=["GET"])
def get(key):
    conn = sqlite3.connect("kvs.db")
    c = conn.cursor()
    c.execute("SELECT value FROM kvs WHERE key = ?", (key,))
    row = c.fetchone()
    conn.close()
    
    if row is None:
        return jsonify({"error": "Key not found"}), 404
    
    return jsonify({"content": row[0]})

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
