import os
import uuid

import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS
from psycopg2 import sql

DB_CONNECTION = os.getenv("DB_CONNECTION")

connection = psycopg2.connect(DB_CONNECTION)
cursor = connection.cursor()

app = Flask(__name__)
CORS(app)


def init_db():
    connection = psycopg2.connect(DB_CONNECTION)
    cursor = connection.cursor()

    cursor.execute(
        sql.SQL(
            "create table if not exists data_store (data_key varchar(255) primary key, data_value text);"
        )
    )
    connection.commit()


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
    cursor.execute(
        "INSERT INTO data_store (data_key, data_value) VALUES (%s, %s)", (key, content)
    )
    connection.commit()

    return jsonify({"key": key})


@app.route("/get/<key>", methods=["GET"])
def get(key):
    cursor.execute("SELECT data_value FROM data_store WHERE data_key = %s", (key,))
    row = cursor.fetchone()

    if row is None:
        return jsonify({"error": "Key not found"}), 404

    return jsonify({"content": row[0]})


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=8080, debug=True)
