def get_health_alerts(city):
    """Generate health alerts based on weather"""
    from weather_api import get_weather
    weather = get_weather(city)
    
    alerts = []
    temp = weather.get("temperature", 30)
    humidity = weather.get("humidity", 50)
    
    # Heat alert
    if temp > 35:
        alerts.append({
            "type": "heat",
            "icon": "🔥",
            "message": "Heat wave warning! Avoid outdoor 12-4 PM. Stay hydrated.",
            "severity": "high"
        })
    
    # UV alert
    if temp > 30:
        alerts.append({
            "type": "uv",
            "icon": "☀️",
            "message": "High UV index today. Apply sunscreen before going out.",
            "severity": "medium"
        })
    
    # Asthma alert
    if humidity > 80:
        alerts.append({
            "type": "asthma",
            "icon": "🫁",
            "message": "High humidity detected. Asthma patients should avoid outdoor activities.",
            "severity": "medium"
        })
    
    # Dengue alert (after rain)
    if humidity > 75 and temp > 25:
        alerts.append({
            "type": "dengue",
            "icon": "🦟",
            "message": "Post-rain mosquito risk. Empty stagnant water near your home.",
            "severity": "low"
        })
    
    # If no alerts
    if not alerts:
        alerts.append({
            "type": "good",
            "icon": "✅",
            "message": "Weather looks good today! No health warnings.",
            "severity": "low"
        })
    
    return alerts
