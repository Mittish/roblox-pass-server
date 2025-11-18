from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

ROBLOX_API = "https://games.roblox.com/v1/users/{}/game-passes"

@app.route("/getpasses", methods=["GET"])
def getpasses():
    user_id = request.args.get("userid")

    if not user_id:
        return jsonify({"error": "userid missing"}), 400

    # Запрос к официальному API Roblox
    r = requests.get(ROBLOX_API.format(user_id))

    if r.status_code != 200:
        return jsonify({"error": "roblox api error"}), 500

    data = r.json()

    passes = []

    for item in data.get("data", []):
        passes.append({
            "id": item["id"],
            "name": item["name"],
            "price": item.get("price", 0)
        })

    return jsonify({
        "userid": user_id,
        "passes": passes
    })


@app.route("/")
def home():
    return "Roblox Pass Server is running!"
