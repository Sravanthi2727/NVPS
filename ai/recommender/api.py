from flask import Flask, request, jsonify
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)

# ================= PATH SETUP =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "../data")

# ================= DATA =================
drinks = pd.read_csv(os.path.join(DATA_DIR, "drinks.csv"))
food = pd.read_csv(os.path.join(DATA_DIR, "food.csv"))
pairing = pd.read_csv(os.path.join(DATA_DIR, "pairing.csv"))


# ================= MODEL =================
encoder = LabelEncoder()
drinks["cat_enc"] = encoder.fit_transform(drinks["category"])
drinks["temp_enc"] = encoder.fit_transform(drinks["temperature"])
drinks["milk_enc"] = encoder.fit_transform(drinks["milk_based"])
drinks["level_enc"] = encoder.fit_transform(drinks["level"])

X = drinks[["cat_enc", "temp_enc", "milk_enc", "price", "level_enc"]]
similarity = cosine_similarity(X)

# ================= LOGIC =================
def recommend_model(drink_name):
    if drink_name not in drinks["name"].values:
        return {"error": "Drink not found"}

    idx = drinks[drinks["name"] == drink_name].index[0]
    selected = drinks.iloc[idx]

    # Similar drinks
    similar_idx = similarity[idx].argsort()[::-1][1:3]
    similar = drinks.iloc[similar_idx]["name"].tolist()

    # Premium upsell
    premium = drinks[
        (drinks["price"] > selected["price"]) &
        (drinks["milk_based"] == selected["milk_based"])
    ].sort_values("price").head(2)["name"].tolist()

    # Food pairing
    rules = pairing[
    (pairing["coffee_category"] == selected["category"]) |
    (pairing["coffee_category"] == selected["level"])
]

    food_rec = food[
        food["name"].isin(rules["food_name"])
    ]["name"].tolist()

    food_rec = food[food["name"].isin(rules["food_name"])]["name"].tolist()

    return {
        "selected_drink": selected["name"],
        "similar_drinks": similar,
        "premium_upsell": premium,
        "food_pairings": food_rec
    }

# ================= API =================
@app.route("/recommend", methods=["GET"])
def recommend():
    drink = request.args.get("drink")
    if not drink:
        return jsonify({"error": "drink query param required"}), 400

    return jsonify(recommend_model(drink))

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
