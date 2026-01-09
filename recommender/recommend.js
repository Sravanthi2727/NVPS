import pandas as pd

# Load datasets
drinks = pd.read_csv("../data/drinks.csv")
food = pd.read_csv("../data/food.csv")
pairing = pd.read_csv("../data/pairing.csv")


def recommend_system(selected_drink_name):
    # 1. Selected drink
    selected = drinks[drinks["name"] == selected_drink_name]

    if selected.empty:
        return {"error": "Drink not found"}

    selected = selected.iloc[0]

    # 2. Premium coffee recommendation (upsell)
    premium_reco = drinks[
        (drinks["price"] > selected["price"]) &
        (drinks["milk_based"] == selected["milk_based"]) &
        (drinks["temperature"] == selected["temperature"])
    ].sort_values("price").head(2)

    # 3. Food pairing logic
    pairing_rules = pairing[
        (pairing["drink_category"] == selected["category"]) |
        (pairing["drink_category"] == selected["level"])
    ]

    food_reco = food[
        food["name"].isin(pairing_rules["food_name"])
    ]

    # 4. Output
    return {
        "selected_drink": selected["name"],
        "price": int(selected["price"]),
        "recommended_premium_drinks": premium_reco["name"].tolist(),
        "food_pairings": food_reco["name"].tolist()
    }


// # 🔥 TEST DEMO
if __name__ == "__main__":
    result = recommend_system("Iced Latte")
    print(result)
