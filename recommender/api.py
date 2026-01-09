from flask import Flask, request, jsonify
import pandas as pd

app = Flask(__name__)

# Load datasets
drinks = pd.read_csv("../data/drinks.csv")
food = pd.read_csv("../data/food.csv")
pairing = pd.read_csv("../data/pairing.csv")


def recommend_system(selected_drink_name):
    selected = drinks[drinks["name"] == selected_drink_name]

    if selected.empty:
        return {"error": "Drink not found"}

    selected = selected.iloc[0]

    # Premium upsell recommendation
    premium_reco = drinks[
        (drinks["price"] > selected["price"]) &
        (drinks["milk_based"] == selected["milk_based"]) &
        (drinks["temperature"] == selected["temperature"])
    ].sort_values("price").head(2)

    # Food pairing
    pairing_rules = pairing[
        (pairing["drink_category"] == selected["category"]) |
        (pairing["drink_category"] == selected["level"])
    ]

    food_reco = food[
        food["name"].isin(pairing_rules["food_name"])
    ]

    return {
        "selected_drink": selected["name"],
        "price": int(selected["price"]),
        "recommended_premium_drinks": premium_reco["name"].tolist(),
        "food_pairings": food_reco["name"].tolist()
    }


#  API ROUTE
@app.route("/recommend", methods=["GET"])
def recommend():
    drink_name = request.args.get("drink")

    if not drink_name:
        return jsonify({"error": "drink parameter is required"}), 400

    result = recommend_system(drink_name)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
