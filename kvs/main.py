import os
import uuid

from db_sqlite import DBSqlite
from db_postgres import DBPostgres

from flask import Flask, jsonify, request
from flask_cors import CORS

db = None

if os.getenv("DB_HOST") == "sqlite":
    print("use sqlite")
    db = DBSqlite()
else:
    print("use postgres")
    db = DBPostgres()

db.init_db()

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Hello, World!"})


@app.route("/put", methods=["POST"])
def put():
    content = request.json.get("content")
    if content is None:
        return jsonify({"error": "Missing content"}), 400

    if len(content) > 1024 * 1024:  #  1 mb
        return jsonify({"error": "Too large content"}), 400
    key = str(uuid.uuid4())[0:3] + "-" + str(uuid.uuid4())[0:3]
    db.put(key, content)

    return jsonify({"key": key})


@app.route("/get/<key>", methods=["GET"])
def get(key):
    result = db.get(key)
    if result is None:
        return jsonify({"error": "Key not found"}), 404

    return jsonify({"content": result})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
