import requests
import json
from datetime import datetime, timedelta

IMD_API_BASE = "https://api.imd.gov.in/api/v1"

CITY_STATIONS = {
    "delhi": "42182", "mumbai": "43003",
    "kochi": "43371", "chennai": "43279",
    "kolkata": "42809", "bangalore": "43295",
    "hyderabad": "43271", "pune": "43169",
    "ahmedabad": "42558", "jaipur": "42339",
    "lucknow": "42369", "goa": "43169",
    "shimla": "42027", "srinagar": "42027",
    "nagpur": "42314", "indore": "42347",
}

COORDS = [
    (28.61, 77.21, "delhi"), (19.08, 72.88, "mumbai"),
    (9.93, 76.27, "kochi"), (13.08, 80.27, "chennai"),
    (22.57, 88.36, "kolkata"), (12.97, 77.59, "bangalore"),
    (17.39, 78.49, "hyderabad"), (18.52, 73.86, "pune"),
    (23.02, 72.57, "ahmedabad"), (26.91, 75.79, "jaipur"),
    (26.85, 80.95, "lucknow"), (15.49, 73.83, "goa"),
]
def get_nearest_city(lat, lon):
    min_dist = float("inf")
    nearest = "delhi"
    for clat, clon, city in COORDS:
        dist = ((lat - clat) ** 2 + (lon - clon) ** 2) ** 0.5
        if dist < min_dist:
            min_dist = dist
            nearest = city
    return nearest

def get_weather(city):
    city_lower = city.lower().strip()
    station_id = CITY_STATIONS.get(city_lower, "42182")
    try:
        url = IMD_API_BASE + "/cityforecast"
        r = requests.get(url, params={"id": station_id}, timeout=8)
        if r.status_code == 200:
            data = r.json()
            if data and isinstance(data, dict) and len(data) > 2:
                return _parse_imd(city, data)
    except Exception as e:
        print("IMD error:", e)
    try:
        coords = {"delhi":(28.61,77.21),"mumbai":(19.08,72.88),"kochi":(9.93,76.27),"chennai":(13.08,80.27),"kolkata":(22.57,88.36),"bangalore":(12.97,77.59),"hyderabad":(17.39,78.49),"pune":(18.52,73.86),"ahmedabad":(23.02,72.57),"jaipur":(26.91,75.79),"lucknow":(26.85,80.95)}
        lat, lon = coords.get(city_lower, (28.61, 77.21))
        url = "https://api.open-meteo.com/v1/forecast?latitude=" + str(lat) + "&longitude=" + str(lon) + "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Kolkata&forecast_days=7"
        r = requests.get(url, timeout=8)
        if r.status_code == 200:
            return _parse_open_meteo(city, r.json())
    except Exception as e:
        print("Open-Meteo error:", e)
    return get_mock_weather(city)
WMO_CODES = {0:"Clear Sky",1:"Mainly Clear",2:"Partly Cloudy",3:"Overcast",
    45:"Fog",48:"Rime Fog",51:"Light Drizzle",53:"Moderate Drizzle",
    55:"Dense Drizzle",61:"Slight Rain",63:"Moderate Rain",65:"Heavy Rain",
    71:"Slight Snow",73:"Moderate Snow",75:"Heavy Snow",
    80:"Slight Showers",81:"Moderate Showers",82:"Violent Showers",
    95:"Thunderstorm",96:"Thunderstorm with Hail",99:"Severe Thunderstorm"}

def _parse_imd(city, data):
    return {"city": city, "source": "imd",
        "temperature": data.get("Today_Max_temp",32),
        "humidity": data.get("Relative_Humidity_at_1730",65),
        "condition": data.get("Todays_Forecast","Partly Cloudy"),
        "wind": data.get("Wind_Speed",12),
        "min_temp": data.get("Today_Min_temp",24),
        "forecast": [
            {"day":"Today","max":data.get("Todays_Forecast_Max_Temp",33),"min":data.get("Todays_Forecast_Min_temp",25),"condition":data.get("Todays_Forecast","Sunny")},
            {"day":"Day 2","max":data.get("Day_2_Max_Temp",32),"min":data.get("Day_2_Min_temp",24),"condition":data.get("Day_2_Forecast","Cloudy")},
            {"day":"Day 3","max":data.get("Day_3_Max_Temp",31),"min":data.get("Day_3_Min_temp",23),"condition":data.get("Day_3_Forecast","Rainy")},
            {"day":"Day 4","max":data.get("Day_4_Max_Temp",30),"min":data.get("Day_4_Min_temp",22),"condition":data.get("Day_4_Forecast","Sunny")},
            {"day":"Day 5","max":data.get("Day_5_Max_Temp",31),"min":data.get("Day_5_Min_temp",23),"condition":data.get("Day_5_Forecast","Cloudy")},
            {"day":"Day 6","max":data.get("Day_6_Max_Temp",32),"min":data.get("Day_6_Min_temp",24),"condition":data.get("Day_6_Forecast","Sunny")},
            {"day":"Day 7","max":data.get("Day_7_Max_Temp",33),"min":data.get("Day_7_Min_temp",25),"condition":data.get("Day_7_Forecast","Sunny")}]}
def _parse_open_meteo(city, data):
    c = data.get("current", {})
    d = data.get("daily", {})
    temp = c.get("temperature_2m", 32)
    hum = c.get("relative_humidity_2m", 65)
    wind = c.get("wind_speed_10m", 12)
    code = c.get("weather_code", 0)
    cond = WMO_CODES.get(code, "Partly Cloudy")
    days = ["Today","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7"]
    fc = []
    mx = d.get("temperature_2m_max", [])
    mn = d.get("temperature_2m_min", [])
    wc = d.get("weather_code", [])
    for i in range(min(7, len(mx))):
        dc = wc[i] if i < len(wc) else 0
        fc.append({"day":days[i],"max":mx[i],"min":mn[i],"condition":WMO_CODES.get(dc,"Clear")})
    return {"city":city,"source":"open-meteo","temperature":round(temp,1),"humidity":hum,"condition":cond,"wind":round(wind,1),"min_temp":round(temp-6,1),"forecast":fc}

def get_hourly_weather(city):
    city_lower = city.lower().strip()
    coords = {"delhi":(28.61,77.21),"mumbai":(19.08,72.88),"kochi":(9.93,76.27),"chennai":(13.08,80.27),"kolkata":(22.57,88.36),"bangalore":(12.97,77.59),"hyderabad":(17.39,78.49),"pune":(18.52,73.86),"ahmedabad":(23.02,72.57),"jaipur":(26.91,75.79),"lucknow":(26.85,80.95)}
    lat, lon = coords.get(city_lower, (28.61, 77.21))
    try:
        url = "https://api.open-meteo.com/v1/forecast?latitude=" + str(lat) + "&longitude=" + str(lon) + "&hourly=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia/Kolkata&forecast_days=1"
        r = requests.get(url, timeout=8)
        if r.status_code == 200:
            h = r.json().get("hourly", {})
            ts = h.get("time",[])
            tmp = h.get("temperature_2m",[])
            hu = h.get("relative_humidity_2m",[])
            wc = h.get("weather_code",[])
            hourly = []
            for i in range(min(24, len(ts))):
                t = ts[i][11:16] if len(ts[i]) > 16 else str(i).zfill(2) + ":00"
                hourly.append({"time":t,"temp":round(tmp[i],1) if i<len(tmp) else 30,"humidity":hu[i] if i<len(hu) else 65,"condition":WMO_CODES.get(wc[i] if i<len(wc) else 0,"Clear")})
            return {"city":city,"source":"open-meteo","hourly":hourly}
    except Exception as e:
        print("Hourly error:", e)
    return _hourly_fallback(city)
def _hourly_fallback(city):
    w = get_weather(city)
    bt = w.get("temperature", 30)
    hourly = []
    now = datetime.now()
    for i in range(24):
        h = now + timedelta(hours=i)
        if 6 <= h.hour <= 18:
            t = bt + (h.hour - 12) * 0.5
        else:
            t = bt - 5 + (h.hour - 24) * 0.3
        t = max(20, min(40, t))
        hourly.append({"time":h.strftime("%H:%M"),"temp":round(t,1),"humidity":w.get("humidity",65),"condition":w.get("condition","Partly Cloudy")})
    return {"city":city,"source":"calculated","hourly":hourly}

def get_mock_weather(city):
    return {"city":city,"source":"mock","temperature":32,"humidity":78,
        "condition":"Partly Cloudy","wind":12,"min_temp":24,
        "forecast":[
            {"day":"Today","max":33,"min":25,"condition":"Sunny"},
            {"day":"Day 2","max":31,"min":24,"condition":"Cloudy"},
            {"day":"Day 3","max":28,"min":23,"condition":"Rainy"},
            {"day":"Day 4","max":30,"min":22,"condition":"Sunny"},
            {"day":"Day 5","max":31,"min":23,"condition":"Cloudy"},
            {"day":"Day 6","max":32,"min":24,"condition":"Sunny"},
            {"day":"Day 7","max":33,"min":25,"condition":"Sunny"}]}

def get_city_coords(city):
    for lat, lon, name in COORDS:
        if name == city:
            return {"lat": lat, "lon": lon}
    return None
