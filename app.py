from flask import Flask, session
from flask_cors import CORS

import auth
import cart
import contact
import orders
import produce
import producers

App = Flask(__name__)
App.secret_key = "greenfield-secret-key" 

CORS(App, supports_credentials=True)

auth.register_routes(App)
cart.register_routes(App)
contact.register_routes(App)
orders.register_routes(App)
produce.register_routes(App)
producers.register_routes(App)

@App.route("/")
def home():
    return {"message": "Greenfield API running"}

if __name__ == "__main__":
    App.run(debug=True, use_reloader=False)