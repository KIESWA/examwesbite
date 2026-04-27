from flask import request, jsonify
import data

def register_routes(app):

    @app.route("/api/contact", methods=["POST"])
    def contact():
        data.messages.append(request.json)
        return jsonify({"message": "Message received"})