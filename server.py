from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route("/getpasses")
def getpasses():
    user_id = request.args.get("userid")
    if not user_id:
        return jsonify({"error": "no userid"}), 400

    url = f"https://catalog.roblox.com/v1/search/items/details?CreatorTargetId={user_id}&CreatorType=User&ItemType=Pass"

    try:
        response = requests.get(url, timeout=5)
        data = response.json()

        if "data" not in data:
            return jsonify({"error": "roblox api returned invalid data"})

        passes = []
        for item in data["data"]:
            passes.append({
                "id": item["id"],
                "name": item["name"],
                "price": item["price"] if "price" in item else 0
            })

        return jsonify({"passes": passes})

    except Exception as e:
        return jsonify({"error": "roblox api error", "details": str(e)})
