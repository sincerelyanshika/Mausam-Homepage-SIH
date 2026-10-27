# MAUSAM PERSONALIZED - Complete Project Explanation
## SIH 2026 | Problem Statement: SIH26076

---

# 1. PROBLEM STATEMENT

PS Code: SIH26076
Organization: Ministry of Earth Sciences (MoES)
Theme: Miscellaneous
Track: Track 1 (CS, AI/ML, Digital Technology)

India has an official weather app called Mausam built by IMD.
It is used by millions of Indians. But it has major problems:

1. No Personalization - A farmer in Kerala and a student in Delhi see the same page.
2. No Voice Support - No voice feature in regional languages like Malayalam, Tamil.
3. No Health Alerts - High humidity triggers asthma. Rain increases dengue risk.
4. Boring Interface - Looks outdated. Only 3.1 stars on Play Store.
5. No Hourly Forecast - Users want to know if it will rain at 3 PM.

---

# 2. OUR SOLUTION

We built Mausam Personalized - a smart weather companion that adapts to every user.

User Flow:
1. User opens the app
2. Selects city (Delhi/Mumbai/Kochi/Chennai/Kolkata)
3. Selects profile (General/Farmer/Student/Commuter)
4. Selects language (English/Hindi/Malayalam/Tamil)
5. Clicks Get Weather button
6. App shows personalized weather with all features

What the app shows:
1. Current Weather - Temperature, Humidity, Condition, Wind Speed
2. Hourly Forecast - Next 24 hours, scrollable cards
3. Health Alerts - UV warning, Asthma risk, Dengue risk
4. Recipe Suggestions - What to cook based on weather
5. 7-Day Forecast - Full week with max/min temps
6. Voice Weather - Speak in your language, hear weather back

---

# 3. TECH STACK

FRONTEND: HTML5, CSS3, Tailwind CSS (CDN), Vanilla JavaScript, Poppins Font, Web Speech API
BACKEND: Python, Flask, Flask-CORS, Requests
DATABASE: SQLite
APIS: IMD Weather API (free), Web Speech API (free, Chrome)

Why not React/Node/Flutter?
Our team knows HTML, CSS, JS, Python, SQL. Working demo > Broken advanced demo.

---

# 4. PROJECT STRUCTURE

mausam-personalized/
  frontend/
    index.html          <- Main HTML page
    css/style.css       <- All styling (glassmorphism, animations)
    js/app.js           <- Main logic (API calls, rendering)
    js/voice.js         <- Voice feature (speech recognition)
  backend/
    app.py              <- Flask server (main entry point)
    weather_api.py      <- IMD API calls + mock data
    health_alerts.py    <- Health alert logic
    recipes.py          <- Recipe suggestion logic
    database.py         <- SQLite database operations
    requirements.txt    <- Python packages
  database/             <- SQLite file goes here
  docs/                 <- Documentation
---

# 5. FILE-BY-FILE EXPLANATION

## FILE 1: frontend/index.html

Main page the user sees. Structure:
1. HEAD - Load Tailwind CSS from CDN, Poppins font, style.css
2. ANIMATED BACKGROUND - Three floating white circles + gradient
3. HEADER (sticky) - Logo with gradient text + Voice button
4. HERO SECTION - Welcome message
5. LOCATION SELECTOR - 3 dropdowns + Get Weather button
6. CURRENT WEATHER (hidden) - 4 stat cards
7. HOURLY FORECAST (hidden) - Horizontal scrollable cards
8. HEALTH ALERTS (hidden) - Color-coded alert cards
9. RECIPE SUGGESTIONS (hidden) - 3 recipe cards with emoji
10. 7-DAY FORECAST (hidden) - 7 cards in grid
11. FOOTER - IMD credit + SIH 2026
12. SCRIPTS - Load app.js and voice.js

All weather sections start hidden and appear after clicking Get Weather.

## FILE 2: frontend/css/style.css

Makes the app look beautiful. Key features:
1. Animated Gradient Background - Colors shift every 15 seconds
2. Floating Shapes - White circles drift around
3. Glassmorphism - Cards have frosted glass effect (75% white + 20px blur)
4. Custom Select Dropdowns - Custom arrow icon, blue focus ring
5. Gradient Buttons - Blue-to-Cyan (Get Weather), Red-to-Orange (Voice)
6. Weather Stat Cards - Blue gradient text, hover lift effect
7. Hourly Cards - Light blue gradient, custom scrollbar
8. Health Alert Colors - Red (high), Yellow (medium), Green (low)
9. Fade-in Animation - Cards fade in when data loads
10. Voice Button Pulse - Button pulses during listening

## FILE 3: frontend/js/app.js

Connects frontend to backend. Makes API calls and renders data.

How it works:
1. API_BASE = /api (all API calls go through Flask)
2. Button click handler reads city selection
3. Makes 4 fetch() calls simultaneously:
   - /api/weather/delhi -> Current weather + 7-day forecast
   - /api/hourly/delhi -> 24-hour hourly forecast
   - /api/health-alerts/delhi -> Health warnings
   - /api/recipes/delhi -> Recipe suggestions
4. Each response parsed as JSON
5. JavaScript updates HTML:
   - Sets temp, humidity, condition, wind text
   - Calls renderHourly() to create 24 hourly cards
   - Calls renderForecast() to create 7 forecast cards
   - Creates health alert cards with severity colors
   - Creates recipe cards with emoji, name, time

Helper Functions:
- renderHourly(hourlyData) - Creates 24 horizontal cards
- renderForecast(forecast) - Creates 7 grid cards

## FILE 4: frontend/js/voice.js

Voice recognition + text-to-speech in regional languages.

How it works:
1. User clicks Speak Weather button
2. Button changes to Listening... (pulsing animation)
3. App sets language based on dropdown (en-IN/hi-IN/ml-IN/ta-IN)
4. Browser listens for speech (Web Speech API)
5. User speaks (e.g., Aaj ka mausam batao)
6. Browser converts speech to text
7. App fetches weather from API
8. App generates response in selected language
9. Browser speaks the response using Text-to-Speech

Example Hindi: Aaj delhi me temperature 32 degree Celsius hai.
Important: Voice only works in Chrome browser.

## FILE 5: backend/app.py

Flask server - main entry point. Handles all requests.

API Routes (return JSON):
  GET  /api/weather/<city>        -> get_weather()
  GET  /api/hourly/<city>         -> get_hourly_weather()
  GET  /api/health-alerts/<city>  -> get_health_alerts()
  GET  /api/recipes/<city>        -> get_recipe_suggestion()
  POST /api/user                  -> save_user()
  GET  /api/user/<id>             -> get_user()

Static File Routes (serve HTML/CSS/JS):
  GET  /                    -> index.html
  GET  /css/<filename>      -> CSS files
  GET  /js/<filename>       -> JS files

Why API routes come first:
If we put / before /api/..., Flask would intercept API calls as static files.
## FILE 6: backend/weather_api.py

Fetches weather from IMD API or provides mock data.

IMD API Integration:
  IMD_API_BASE = https://api.imd.gov.in/api/v1
  City to station mapping: delhi=42182, mumbai=43003, kochi=43371, chennai=43279, kolkata=42809
  Calls /cityforecast endpoint with station ID
  Returns: temperature, humidity, condition, wind, 7-day forecast

Mock Data (fallback):
  If IMD API fails, mock data is returned automatically.
  Demo always works even if API is down.

Hourly Weather Logic:
  Generates 24 hours of forecast
  Daytime (6AM-6PM): temp rises toward noon
  Nighttime: temp drops gradually
  Clamped between 20C and 40C

## FILE 7: backend/health_alerts.py

Generates health warnings based on weather conditions.

Decision Tree:
  IF temp > 35C  -> HEAT WAVE (HIGH severity, red)
  IF temp > 30C  -> UV INDEX (MEDIUM severity, yellow)
  IF humidity > 80% -> ASTHMA RISK (MEDIUM severity, yellow)
  IF humidity > 75% AND temp > 25C -> DENGUE RISK (LOW severity, green)
  ELSE -> ALL CLEAR (LOW severity, green)

Why these conditions matter in India:
  - Heat waves kill 1000+ people per year
  - UV damage causes skin cancer
  - 30 million Indians have asthma
  - Dengue is a major urban health crisis

## FILE 8: backend/recipes.py

Suggests Indian recipes based on current weather.

Logic:
  IF rain in condition -> Rainy: Chai, Pakora, Maggi
  IF temp > 35C -> Hot: Aam Panna, Thandai, Nimbu Pani
  IF temp < 15C -> Cold: Gajar Halwa, Hot Soup, Chai+Biscuit
  ELSE -> Pleasant: Samosa, Sandwich, Fruit Salad

Why recipes? No other weather app has this. Creates emotional connection.
Judges remember fun features. When it rains, everyone wants chai and pakoras.

## FILE 9: backend/database.py

SQLite database for user profiles and weather cache.

Tables:
  users (id, name, city, user_type, language, created_at)
  weather_cache (id, city, weather_data, fetched_at)

Functions:
  init_db() - Creates tables on server start
  save_user(data) - Saves user profile
  get_user(id) - Gets user by ID

Why SQLite? No installation needed, comes with Python, perfect for hackathons.
---

# 6. API FLOW - Complete Example

User clicks Get Weather for Delhi:

Request 1: GET /api/weather/delhi
  Response: {city: delhi, temperature: 32, humidity: 78, condition: Partly Cloudy, wind: 12, forecast: [...7 days...]}

Request 2: GET /api/hourly/delhi
  Response: {city: delhi, hourly: [{time: 14:00, temp: 32.0, humidity: 78, condition: Partly Cloudy}...24 entries...]}

Request 3: GET /api/health-alerts/delhi
  Response: [{type: uv, icon: sun, message: High UV index..., severity: medium}, {type: dengue...}]

Request 4: GET /api/recipes/delhi
  Response: {weather: Pleasant, recipes: [{name: Samosa, emoji: dumpling, time: 25 min}...3 recipes...]}

---

# 7. FEATURES DEEP DIVE

Feature 1: Current Weather Dashboard
  4 stat cards: Temperature, Humidity, Condition, Wind Speed
  Updates when user clicks Get Weather. Fade-in animation.

Feature 2: Hourly Forecast
  24 cards in horizontal scroll
  Each shows time, temp, condition, humidity
  Temperature varies: rises during day, drops at night
  Clamped between 20C and 40C

Feature 3: Health Alerts
  Color-coded alerts based on weather:
  - Heat Wave (temp > 35C) - Red
  - UV Index (temp > 30C) - Yellow
  - Asthma Risk (humidity > 80%) - Yellow
  - Dengue Risk (humidity > 75% + temp > 25C) - Green

Feature 4: Recipe Suggestor (Desi Touch)
  Weather-based Indian recipes:
  - Rainy: Chai, Pakora, Maggi
  - Hot: Aam Panna, Thandai, Nimbu Pani
  - Cold: Gajar Halwa, Hot Soup
  - Pleasant: Samosa, Sandwich, Fruit Salad

Feature 5: 7-Day Forecast
  7 cards in grid: day name, max temp, min temp, condition

Feature 6: Voice Weather (Regional Languages)
  User speaks, app responds in same language
  Supports: English, Hindi, Malayalam, Tamil
  Uses Web Speech API (Chrome only)

---

# 8. UI/UX DESIGN

Design Philosophy: Glassmorphism (frosted glass effect)
Used by Apple (iOS), Microsoft (Windows 11), Google (Material Design 3)

Color Scheme:
  Background: Animated gradient (orange-pink-blue-green)
  Cards: White at 75% opacity + 20px blur
  Primary Button: Blue to Cyan gradient
  Voice Button: Red to Orange gradient
  Temperature Text: Dark Blue to Cyan gradient

Typography: Poppins font (Google Fonts)
Modern, clean, readable, popular in Indian web design

Animations:
  1. Gradient Shift - Background colors shift every 15 seconds
  2. Floating Shapes - White circles drift around
  3. Card Hover - Cards lift up and shadow deepens
  4. Voice Pulse - Button scales during listening
  5. Fade-in - Weather sections fade in when data loads

Responsive Design:
  Mobile: Single column, full-width cards
  Desktop: Multi-column grids
---

# 9. HOW TO RUN

Prerequisites: Python 3.8+, Chrome browser, Internet

Step 1: Install Dependencies
  cd backend
  pip install -r requirements.txt

Step 2: Start Server
  python app.py
  Output: Starting Mausam Personalized on http://localhost:5000

Step 3: Open Chrome
  Go to: http://localhost:5000

Step 4: Use the App
  1. Select city, user type, language
  2. Click Get Weather
  3. See all features load
  4. Test voice in Chrome

---

# 10. CHALLENGES FACED

1. HTML Truncation
   Problem: Shell heredoc cut off HTML file during creation.
   Solution: Used Python file write instead of shell heredoc.

2. Flask Route Ordering
   Problem: Catch-all route intercepted API calls.
   Solution: Put API routes (/api/...) before static file routes (/).

3. JavaScript Not Loading
   Problem: Browser showed API_BASE undefined because script tags were missing.
   Solution: Fixed truncated HTML that was missing closing tags and script tags.

4. Duplicate Footer
   Problem: Failed file append created duplicate footer section.
   Solution: Found and removed the duplicate using string splitting.

5. IMD API Unreliability
   Problem: IMD API might be slow or down during hackathon demo.
   Solution: Added mock data fallback. Demo always works.

6. Windows Background Process
   Problem: Bash background operator does not work on Windows.
   Solution: Used Python subprocess.Popen to start Flask in background.

---

# 11. FUTURE SCOPE

Short Term (After SIH):
  - Add more cities (all 28 state capitals)
  - Add farmer-specific features (crop advisory)
  - Add push notifications (Firebase)
  - Deploy to production (Vercel + Render)

Medium Term:
  - AI-powered personalized recommendations (ML)
  - Community weather reports (crowdsourced)
  - Weather gamification (daily check-in points)
  - More regional languages (Bengali, Kannada, Telugu)

Long Term:
  - Full Mausam app integration with IMD
  - Agricultural advisory system
  - Natural disaster early warning
  - Air quality monitoring integration
  - Smart city weather dashboard

---

# 12. DATABASE DESIGN

Table: users
  id INTEGER PRIMARY KEY AUTOINCREMENT
  name TEXT
  city TEXT
  user_type TEXT (general/farmer/student/commuter)
  language TEXT (english/hindi/malayalam/tamil)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Table: weather_cache
  id INTEGER PRIMARY KEY AUTOINCREMENT
  city TEXT
  weather_data TEXT (JSON string)
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

Version: 1.0
Last Updated: August 2026
Smart India Hackathon 2026 | Problem Statement SIH26076
