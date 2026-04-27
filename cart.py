from flask import request, jsonify, session

def register_routes(app):

    @app.route("/api/cart", methods=["GET"])
    def get_cart():
        return jsonify(session.get("cart", []))

    @app.route("/api/cart/add", methods=["POST"])
    def add_cart():
        if "cart" not in session:
            session["cart"] = []
        
        cart_list = session["cart"]
        cart_list.append(request.json)
        session["cart"] = cart_list 
        
        return jsonify({"message": "Added to your personal cart"})

    @app.route("/api/cart/remove", methods=["POST"])
    def remove_cart():
        name = request.json.get("name")
        if "cart" in session:
            session["cart"] = [i for i in session["cart"] if i.get("name") != name]
        
        return jsonify({"message": "Removed from your personal cart"})
