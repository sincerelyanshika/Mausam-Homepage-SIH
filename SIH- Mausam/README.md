# Mausam Personalized - SIH 2026

Smart Weather Companion for Every Indian Citizen

## Problem Statement

**PS ID:** SIH26076

**Organization:** Ministry of Earth Sciences (MoES)

**Theme:** Miscellaneous

## Features

1. **Voice Weather** - Speak in Hindi/Malayalam/Tamil and get weather updates
2. **Health Alerts** - Weather-based health warnings (UV, asthma, dengue, heat)
3. **Recipe Suggestions** - Fun feature suggesting what to cook based on weather
4. **Hourly Forecast** - 24-hour weather prediction

## Tech Stack

- **Frontend:** HTML5, CSS3 (Tailwind), JavaScript
- **Backend:** Python Flask
- **Database:** SQLite
- **APIs:** IMD Weather APIs

## How to Run

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Server starts at http://localhost:5000

### Frontend

Open `frontend/index.html` in Chrome browser.

## Project Structure

```
mausam-personalized/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       └── voice.js
├── backend/
│   ├── app.py
│   ├── weather_api.py
│   ├── health_alerts.py
│   ├── recipes.py
│   ├── database.py
│   └── requirements.txt
├── database/
├── docs/
└── README.md
```

## License

SIH 2026 Project
