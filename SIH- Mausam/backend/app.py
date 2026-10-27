import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from weather_api import get_weather, get_hourly_weather, get_nearest_city
from health_alerts import get_health_alerts
from recipes import get_recipe_suggestion
from database import init_db, save_user, get_user

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")

app = Flask(__name__)
CORS(app)
init_db()

# ========== API ROUTES ==========

@app.route("/api/weather/<city>")
def weather(city):
    data = get_weather(city)
    return jsonify(data)

@app.route("/api/hourly/<city>")
def hourly_weather(city):
    data = get_hourly_weather(city)
    return jsonify(data)

@app.route("/api/health-alerts/<city>")
def health_alerts(city):
    alerts = get_health_alerts(city)
    return jsonify(alerts)

@app.route("/api/recipes/<city>")
def recipes(city):
    suggestions = get_recipe_suggestion(city)
    return jsonify(suggestions)

@app.route("/api/geocode")
def geocode():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat is None or lon is None:
        return jsonify({"error": "lat and lon required"}), 400
    city = get_nearest_city(lat, lon)
    return jsonify({"city": city, "lat": lat, "lon": lon})

@app.route("/api/aqi/<city>")
def aqi(city):
    from weather_api import get_city_coords
    coords = get_city_coords(city)
    if not coords:
        return jsonify({"aqi": 0, "category": "Unknown", "pm25": 0, "advice": "Data unavailable"})
    try:
        import requests
        url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={coords['lat']}&longitude={coords['lon']}&current=european_aqi,pm10,pm2_5"
        r = requests.get(url, timeout=10)
        d = r.json()
        current = d.get("current", {})
        aqi_val = current.get("european_aqi", 0)
        pm25 = current.get("pm2_5", 0)
        pm10 = current.get("pm10", 0)
        if aqi_val <= 20:
            cat = "Good"
            advice = "Air quality is excellent. Enjoy outdoor activities!"
        elif aqi_val <= 40:
            cat = "Fair"
            advice = "Acceptable for most people. Sensitive groups should limit prolonged outdoor exposure."
        elif aqi_val <= 60:
            cat = "Moderate"
            advice = "Unhealthy for sensitive groups. Children and elderly should reduce outdoor time."
        elif aqi_val <= 80:
            cat = "Poor"
            advice = "Wear masks outdoors. Avoid strenuous outdoor activities."
        elif aqi_val <= 100:
            cat = "Very Poor"
            advice = "Stay indoors if possible. Keep windows closed."
        else:
            cat = "Extremely Poor"
            advice = "Health emergency! Stay indoors, use air purifiers."
        return jsonify({"aqi": aqi_val, "category": cat, "pm25": round(pm25, 1), "pm10": round(pm10, 1), "advice": advice})
    except Exception as e:
        return jsonify({"aqi": 0, "category": "Unavailable", "pm25": 0, "pm10": 0, "advice": "Could not fetch AQI data"})

@app.route("/api/pincode/<pincode>")
def pincode_lookup(pincode):
    try:
        lat, lon = get_pincode_coords(pincode)
        if lat:
            nearest_city = get_nearest_city(lat, lon)
            return jsonify({"city": nearest_city, "district": "", "state": "", "locality": "Pincode " + pincode, "lat": lat, "lon": lon})
        return jsonify({"error": "Pincode not found in our database. Try selecting a city manually."}), 404
    except Exception:
        return jsonify({"error": "Could not lookup pincode"}), 500

def get_pincode_coords(pincode):
    try:
        import requests
        coords_map = {
            "110": (28.6139, 77.2090), "400": (19.0760, 72.8777), "560": (12.9716, 77.5946),
            "600": (13.0827, 80.2707), "700": (22.5726, 88.3639), "500": (17.3850, 78.4867),
            "411": (18.5204, 73.8567), "302": (26.9124, 75.7873), "380": (23.0225, 72.5714),
            "226": (26.8467, 80.9462), "300": (26.9258, 75.7873),
        }
        prefix = pincode[:3]
        if prefix in coords_map:
            return coords_map[prefix]
        url = f"https://nominatim.openstreetmap.org/search?postalcode={pincode}&country=India&format=json"
        headers = {"User-Agent": "MausamApp/1.0"}
        r = requests.get(url, headers=headers, timeout=10)
        results = r.json()
        if results:
            return float(results[0]["lat"]), float(results[0]["lon"])
        return None, None
    except Exception:
        return None, None

@app.route("/api/user", methods=["POST"])
def save_user_profile():
    data = request.json
    save_user(data)
    return jsonify({"status": "success"})

@app.route("/api/user/<int:user_id>")
def user_profile(user_id):
    user = get_user(user_id)
    return jsonify(user)

# ========== STATIC FILE SERVING ==========

@app.route("/")
def serve_index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/css/<path:filename>")
def serve_css(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, "css"), filename)

@app.route("/js/<path:filename>")
def serve_js(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, "js"), filename)

@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, "assets"), filename)


@app.route("/manifest.json")
def serve_manifest():
    from flask import Response
    p = os.path.join(FRONTEND_DIR, "manifest.json")
    with open(p, "r") as f:
        data = f.read()
    return Response(data, mimetype="application/json")

@app.route("/sw.js")
def serve_sw():
    from flask import Response
    p = os.path.join(FRONTEND_DIR, "sw.js")
    with open(p, "r") as f:
        data = f.read()
    return Response(data, mimetype="application/javascript")

if __name__ == "__main__":
    print("Starting Mausam Personalized on http://localhost:5000")
    app.run(debug=False, port=5000)
