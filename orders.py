from flask import request, jsonify
import data

def register_routes(app):

    @app.route("/api/orders", methods=["GET"])
    def get_orders():
        return jsonify(data.orders)


    @app.route("/api/orders", methods=["POST"])
    def create_order():
        data.orders.append(request.json)
        return jsonify({"message": "Order placed"})