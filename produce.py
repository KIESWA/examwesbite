from flask import request, jsonify
import data

def register_routes(app):

    @app.route("/api/produce", methods=["GET"])
    def get_produce():
        return jsonify(data.produce)

    @app.route("/api/produce", methods=["POST"])
    def add_produce():
        data.produce.append(request.json)
        return jsonify({"message": "Added"})