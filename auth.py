from flask import request, jsonify, session
import data


def register_routes(app):

    @app.route("/api/register", methods=["POST"])
    def register():
        info = request.json

        user = {
            "id": len(data.users) + 1,
            "name": info["name"],
            "email": info["email"],
            "password": info["password"],
            "role": "user"
        }

        data.users.append(user)

        return jsonify({"message": "User created"})


    @app.route("/api/login", methods=["POST"])
    def login():
        info = request.json

        for u in data.users:
            if u["email"] == info["email"] and u["password"] == info["password"]:

                session["user"] = {
                    "id": u["id"],
                    "name": u["name"],
                    "role": u["role"]
                }

                return jsonify(session["user"])

        return jsonify({"error": "Invalid login"}), 401


    @app.route("/api/logout", methods=["POST"])
    def logout():
        session.pop("user", None)
        return jsonify({"message": "Logged out"})


    @app.route("/api/me", methods=["GET"])
    def me():
        return jsonify(session.get("user"))


    
    @app.route("/api/users", methods=["GET"])
    def get_users():
        safe_users = [
            {
                "id": u["id"],
                "name": u["name"],
                "email": u["email"],
                "password": u["password"],
                "role": u["role"]
            }
            for u in data.users
        ]

        return jsonify(safe_users)