from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route("/gamepasses")
def gamepasses():
    user_id = request.args.get("userid")
    if not user_id:
        return jsonify({"error": "no userid"}), 400

    url = f"https://inventory.roblox.com/v1/users/{user_id}/items/GamePass?limit=100"

    try:
        response = requests.get(url, timeout=5).json()
    except:
        return jsonify({"error": "roblox api error"})

    if "data" not in response:
        return jsonify({"passes": []})

    passes = []
    for item in response["data"]:
        passes.append({
            "id": item["item"]["assetId"],
            "name": item["item"]["name"],
            "price": 0
        })

    return jsonify({"passes": passes})


