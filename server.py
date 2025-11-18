from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route("/gamepasses")
def gamepasses():
    user_id = request.args.get("userid")
    if not user_id:
        return jsonify({"error": "no userid"}), 400

    # 1. Получаем игры пользователя
    games_url = f"https://games.roblox.com/v1/users/{user_id}/games?accessFilter=Public&limit=100"
    try:
        games_response = requests.get(games_url, timeout=5).json()
    except:
        return jsonify({"error": "game api error"})

    if "data" not in games_response:
        return jsonify({"error": "no games"})


    passes = []

    # 2. Перебираем игры
    for game in games_response["data"]:
        place_id = game["placeId"]

        gp_url = f"https://games.roblox.com/v1/games/{place_id}/game-passes?limit=100"
        try:
            gp_response = requests.get(gp_url, timeout=5).json()
        except:
            continue

        # 3. Если в игре есть пассы — добавляем
        if "data" in gp_response:
            for p in gp_response["data"]:
                passes.append({
                    "id": p["id"],
                    "name": p["name"],
                    "price": p.get("price", 0)
                })

    return jsonify({"passes": passes})

