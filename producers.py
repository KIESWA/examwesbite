from flask import request, jsonify
import data

def register_routes(app):

    @app.route("/api/producers", methods=["GET"])
    def get_producers():
        return jsonify(data.producers)


    @app.route("/api/producers", methods=["POST"])
    def add_producer():
        data.producers.append(request.json)
        return jsonify({"message": "Added"})