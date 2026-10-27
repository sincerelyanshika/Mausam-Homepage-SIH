# Mausam Personalized - SIH 2026 Project Documentation

## Table of Contents
1. Project Overview
2. The Problem
3. Our Solution
4. Features
5. Tech Stack
6. Architecture
7. Database Schema
8. API Endpoints
9. Frontend Pages
10. Backend Code
11. Deployment Guide
12. 36-Hour Build Plan
13. PPT Format
14. FAQ

---

## Project Overview

**Project Name:** Mausam Personalized - Smart Weather Companion

**Problem Statement ID:** SIH26076

**Organization:** Ministry of Earth Sciences (MoES)

**Theme:** Miscellaneous

**Category:** Software

**Track:** Track 1 (Computer Science, AI/ML, Digital Technology)

**SIH Year:** 2026

---

## The Problem

India has an official weather app called **Mausam** made by IMD (India Meteorological Department). Right now, this app shows the same weather forecast to everyone - whether you are a farmer, a student, a commuter, or an elderly person.

**Problems with current Mausam app:**

1. No personalization - everyone sees the same generic forecast
2. No voice support - you cannot speak and get weather in your language
3. No health alerts - no warnings about UV, asthma, dengue, or heat wave
4. No fun features - just boring numbers and charts
5. Low rating - only 3.1 stars on Play Store

---

## Our Solution

We are building a **personalized homepage** for the Mausam app that changes based on who you are and where you are.

**How it works:**

1. User opens the app
2. User selects their city (Delhi, Mumbai, Kochi, Chennai, Kolkata)
3. User selects their profile type (Farmer, Student, Commuter, General)
4. User selects their language (English, Hindi, Malayalam, Tamil)
5. App shows weather information personalized for that user

**Three key features:**

1. **Voice Weather** - Speak in Hindi/Malayalam/Tamil and get weather update via voice
2. **Health Alerts** - Weather-based health warnings (UV, asthma, dengue, heat)
3. **Recipe Suggestions** - Fun feature suggesting what to cook based on weather

---

## Features

### Feature 1: Voice Weather (Regional Languages)

- User clicks **Speak Weather** button
- App listens to user speaking in Hindi/Malayalam/Tamil
- App speaks back the weather update in the same language
- Works in Chrome browser (uses Web Speech API - built into browser, no external API needed)

**Example:**
- User says: "Aaj ka mausam batao" (Tell me today's weather)
- App says: "Aaj Kochi me temperature 32 degree Celsius hai. Humidity 78 percent hai. Partly cloudy hai."

### Feature 2: Health Alerts

The app automatically shows health alerts based on current weather conditions:

| Weather Condition | Alert |
|------------------|-------|
| Temperature > 35C | Heat wave warning - Avoid outdoor 12-4 PM |
| Temperature > 30C | UV Index high - Apply sunscreen |
| Humidity > 80% | Asthma risk - Avoid outdoor activities |
| Humidity > 75% AND Temp > 25C | Dengue risk - Empty stagnant water |

### Feature 3: Weather Recipe Suggestor

The app suggests recipes based on current weather:

| Weather | Recipes Suggested |
|---------|-------------------|
| Rainy | Masala Chai, Aloo Pakora, Maggi |
| Hot (Temp > 35C) | Aam Panna, Thandai, Nimbu Pani |
| Cold (Temp < 15C) | Gajar Ka Halwa, Hot Soup, Chai + Biscuit |
| Pleasant | Samosa, Sandwich, Fruit Salad |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | HTML5 + CSS3 (Tailwind) + JavaScript | Simple, no framework needed |
| Backend | Python Flask | Lightweight, easy to learn |
| Database | SQLite | Zero setup, just a file |
| APIs | IMD Weather APIs | Official government weather data |
| Voice | Web Speech API | Built into browser, free |
| Hosting | Vercel (frontend) + Render (backend) | Free hosting |

**Important:** We are NOT using React, Node.js, Flutter, or any advanced framework. Everything is built with Python + HTML/CSS/JS.

---

## Architecture

```
+-----------------+     +-----------------+     +-----------------+
|                 |     |                 |     |                 |
|   FRONTEND      |---->|   BACKEND       |---->|   IMD APIs      |
|   HTML/CSS/JS   |<----|   Python Flask  |<----|   Weather Data  |
|                 |     |                 |     |                 |
+-----------------+     +-----------------+     +-----------------+
                              |
                        +-----v-----+
                        |           |
                        |  SQLite   |
                        | Database  |
                        |           |
                        +-----------+
```

**Data Flow:**
1. User selects city + profile type in frontend
2. Frontend sends request to Flask backend
3. Backend fetches weather data from IMD APIs
4. Backend applies personalization rules based on user profile
5. Backend sends personalized response back to frontend
6. Frontend displays weather cards, health alerts, and recipes

---

## Database Schema

### Table: users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    city TEXT,
    user_type TEXT,
    language TEXT,
    created_at TIMESTAMP
);
```

### Table: weather_cache
```sql
CREATE TABLE weather_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT,
    weather_data TEXT,
    fetched_at TIMESTAMP
);
```

### Table: preferences
```sql
CREATE TABLE preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    alert_type TEXT,
    is_enabled BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Table: health_alerts
```sql
CREATE TABLE health_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    alert_message TEXT,
    weather_condition TEXT,
    created_at TIMESTAMP
);
```

---

## API Endpoints

### Our Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/weather/<city> | Get weather for a city |
| GET | /api/health-alerts/<city> | Get health alerts |
| GET | /api/recipes/<city> | Get recipe suggestions |
| POST | /api/user | Save user profile |
| GET | /api/user/<id> | Get user profile |

### IMD API Endpoints (External)

| Endpoint | Description |
|----------|-------------|
| https://api.imd.gov.in/api/v1/cityforecast | City weather forecast (7 days) |
| https://api.imd.gov.in/api/v1/current_wx | Current weather |
| https://api.imd.gov.in/api/v1/districtnowcast | District nowcast (2-hour) |
| https://api.imd.gov.in/api/v1/districtwarning | District warnings (5 days) |
| https://api.imd.gov.in/api/v1/districtrainfall | District rainfall data |

---

## Frontend Pages

### Main Page (index.html)

The main page has these sections:

1. **Header** - App name + Voice button
2. **Location Selector** - Dropdown to select city
3. **Profile Selector** - Dropdown to select user type (Farmer/Student/Commuter/General)
4. **Language Selector** - Dropdown to select language
5. **Get Weather Button** - Click to load weather
6. **Current Weather Card** - Shows temperature, humidity, condition, wind
7. **Health Alerts Section** - Shows health warnings based on weather
8. **Recipe Suggestions Section** - Shows 3 recipe cards
9. **7-Day Forecast Section** - Shows weekly forecast
10. **Footer** - IMD attribution

### Design Guidelines

- Use **Tailwind CSS** via CDN (no npm install needed)
- Use **card-based layout** for all sections
- Use **gradient backgrounds** (blue theme)
- Make it **mobile responsive**
- Use **emojis** for icons
- Keep it **clean and minimal**

---

## Backend Code

### File Structure

```
backend/
+-- app.py              # Main Flask app
+-- weather_api.py      # IMD API calls
+-- health_alerts.py    # Health alert logic
+-- recipes.py          # Recipe suggestion logic
+-- personalization.py  # User preference logic
+-- database.py         # SQLite operations
+-- requirements.txt    # Python dependencies
```

### requirements.txt

```
flask==3.0.0
flask-cors==4.0.0
requests==2.31.0
```

### How to Run Backend

```bash
# Go to backend folder
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py

# Server will start at http://localhost:5000
```

---

## Deployment Guide

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/mausam-personalized.git
git push -u origin main
```

### Step 2: Deploy Backend on Render

1. Go to **render.com**
2. Click **New Web Service**
3. Connect your **GitHub repository**
4. Fill in:
   - **Name:** mausam-backend
   - **Build Command:** pip install -r requirements.txt
   - **Start Command:** python app.py
5. Click **Create Web Service**
6. Wait for deployment to complete
7. Copy the **URL** (e.g., https://mausam-backend.onrender.com)

### Step 3: Deploy Frontend on Vercel

1. Go to **vercel.com**
2. Click **Import Git Repository**
3. Select your **GitHub repository**
4. Framework: **Other**
5. Click **Deploy**
6. Wait for deployment to complete

### Step 4: Update API URL

In your frontend JavaScript file, update the API base URL:

```javascript
// Change this:
const API_BASE = "http://localhost:5000/api";

// To this:
const API_BASE = "https://mausam-backend.onrender.com/api";
```

---

## 36-Hour Build Plan

| Hours | Task | Output |
|-------|------|--------|
| 0-3 | Project setup, Git, folder structure | Skeleton ready |
| 3-6 | Backend: Flask + IMD API integration | Weather API working |
| 6-10 | Backend: Health alerts + Recipe logic | All 3 features backend done |
| 10-15 | Frontend: HTML + CSS + Tailwind | Beautiful UI ready |
| 15-20 | Frontend: JS + API connection | Full app working |
| 20-24 | Voice feature + Testing | Voice weather working |
| 24-28 | Bug fixes + Edge cases | Stable app |
| 28-32 | Deployment (Vercel + Render) | Live demo URL |
| 32-36 | PPT + Presentation practice | Ready to present |

---

## PPT Format (6 Slides - SIH Official)

### Slide 1: Title Page

- Problem Statement ID: SIH26076
- Problem Statement Title: Development of Personalized Homepage for Mausam Mobile Application
- Theme: Miscellaneous
- PS Category: Software
- Team ID
- Team Name
- Members (6 members with roles)
- Mentor name
- College name

### Slide 2: Proposed Solution

Three sections:
1. Detailed explanation of the proposed solution
2. How it addresses the problem
3. Innovation and uniqueness of the solution

### Slide 3: Technical Approach

- System architecture diagram
- Tech stack listed clearly
- Data flow (input -> process -> output)
- Working prototype screenshot

### Slide 4: Feasibility and Viability

- Technical feasibility analysis
- Time feasibility (36-hour breakdown)
- Resource feasibility (all free tools)
- Challenges and solutions table
- Scalability plan

### Slide 5: Impact and Benefits

- Target audience breakdown
- Impact numbers (1.4 billion Indians, 22 languages)
- Government alignment (Digital India, MoES)
- Economic and environmental benefits
- Future scope

### Slide 6: Research and References

- Official sources (IMD, MoES, SIH portal)
- Technical references (Flask, Web Speech API, Tailwind)
- Competitive analysis (current Mausam app, AccuWeather)
- Research papers

**Rules:**
- Max 6 slides (strict)
- PDF format only
- Use points, diagrams, infographics (no paragraphs)
- Min 14pt font
- Under 10MB file size

---

## FAQ

### Q: Do we need to know React or Node.js?

**A:** No. We are using Python Flask for backend and HTML/CSS/JS for frontend. Simple and easy.

### Q: Is the IMD API free?

**A:** Yes, IMD APIs are free and public. However, for production use, you may need IP whitelisting. For the hackathon, we can use mock/fallback data.

### Q: Does voice feature work on all browsers?

**A:** Voice feature works best on **Chrome**. It uses Web Speech API which is built into the browser.

### Q: Can we add more cities?

**A:** Yes, just add more options in the city dropdown. The IMD API supports all Indian cities.

### Q: What if the IMD API is down?

**A:** We have mock/fallback data in our code. If the API fails, the app will show sample weather data.

### Q: How do we demo this at the hackathon?

1. Show the working app on laptop
2. Demo voice feature in Hindi
3. Show health alerts appearing based on weather
4. Show recipe suggestions changing with weather
5. Walk through the architecture diagram

### Q: What makes our solution unique?

1. First weather app with voice in Indian languages
2. Weather + Health correlation alerts
3. Fun recipe feature (no other weather app has this)
4. Personalized based on user profile

---

## Contact

**Team Lead:** [Your Name]
**Email:** [Your Email]
**Phone:** [Your Phone]

---

**Last Updated:** August 2026
