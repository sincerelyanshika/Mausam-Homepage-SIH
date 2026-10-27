def get_recipe_suggestion(city):
    """Suggest recipes based on weather"""
    from weather_api import get_weather
    weather = get_weather(city)
    
    temp = weather.get("temperature", 30)
    humidity = weather.get("humidity", 50)
    condition = weather.get("condition", "Sunny").lower()
    
    if "rain" in condition:
        return {
            "weather": "Rainy ☔",
            "recipes": [
                {"name": "Masala Chai", "emoji": "🍵", "time": "10 min"},
                {"name": "Aloo Pakora", "emoji": "🫘", "time": "20 min"},
                {"name": "Maggi", "emoji": "🍜", "time": "5 min"},
            ]
        }
    elif temp > 35:
        return {
            "weather": "Hot 🔥",
            "recipes": [
                {"name": "Aam Panna", "emoji": "🥭", "time": "15 min"},
                {"name": "Thandai", "emoji": "🥛", "time": "10 min"},
                {"name": "Nimbu Pani", "emoji": "🍋", "time": "5 min"},
            ]
        }
    elif temp < 15:
        return {
            "weather": "Cold 🥶",
            "recipes": [
                {"name": "Gajar Ka Halwa", "emoji": "🥕", "time": "30 min"},
                {"name": "Hot Soup", "emoji": "🍲", "time": "20 min"},
                {"name": "Chai + Biscuit", "emoji": "🍪", "time": "10 min"},
            ]
        }
    else:
        return {
            "weather": "Pleasant 😊",
            "recipes": [
                {"name": "Samosa", "emoji": "🥟", "time": "25 min"},
                {"name": "Sandwich", "emoji": "🥪", "time": "10 min"},
                {"name": "Fruit Salad", "emoji": "🥗", "time": "5 min"},
            ]
        }
