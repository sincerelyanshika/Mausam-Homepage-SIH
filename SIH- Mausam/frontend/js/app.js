const API_BASE = "/api";
var EQ = "'";

function showError(msg) {
    var t = document.getElementById("errorToast");
    t.textContent = msg;
    t.classList.remove("hidden");
    setTimeout(function() { t.classList.add("hidden"); }, 5000);
}

// ===== DARK MODE TOGGLE =====
(function() {
    var btn = document.getElementById("darkModeBtn");
    var saved = localStorage.getItem("mausam-theme");
    if (saved === "light") {
        document.body.classList.add("light-mode");
        btn.textContent = "\u2600\uFE0F";
    }
    btn.addEventListener("click", function() {
        document.body.classList.toggle("light-mode");
        var isLight = document.body.classList.contains("light-mode");
        btn.textContent = isLight ? "\u2600\uFE0F" : "\uD83C\uDF19";
        localStorage.setItem("mausam-theme", isLight ? "light" : "dark");
    });
})();

// ===== GPS DETECT LOCATION =====
document.getElementById("detectBtn").addEventListener("click", function() {
    if (!navigator.geolocation) { showError("Geolocation not supported."); return; }
    var b = document.getElementById("detectBtn");
    b.innerHTML = "Detecting...";
    b.disabled = true;
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            fetch(API_BASE + "/geocode?lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude)
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (data.city) {
                        document.getElementById("citySelect").value = data.city;
                        b.innerHTML = data.city.charAt(0).toUpperCase() + data.city.slice(1);
                        b.classList.add("detected");
                    }
                }).catch(function() { showError("Could not detect city."); });
            b.disabled = false;
        },
        function() { showError("Location denied."); b.disabled = false; },
        { timeout: 10000 }
    );
});

// ===== PINCODE SEARCH =====
document.getElementById("pincodeBtn").addEventListener("click", function() {
    var pin = document.getElementById("pincodeInput").value.trim();
    if (!pin || pin.length !== 6) { showError("Enter a valid 6-digit pincode."); return; }
    var btn = document.getElementById("pincodeBtn");
    btn.textContent = "...";
    btn.disabled = true;
    fetch(API_BASE + "/pincode/" + pin)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.error) { showError(data.error); btn.disabled = false; btn.textContent = "\uD83D\uDD0D"; return; }
            if (data.city) {
                document.getElementById("citySelect").value = data.city;
            }
            showError(data.locality + ", " + data.district + ", " + data.state);
            document.getElementById("errorToast").style.background = "#10b981";
            setTimeout(function() { document.getElementById("errorToast").classList.add("hidden"); document.getElementById("errorToast").style.background = "#ef4444"; }, 3000);
            btn.textContent = "\u2705";
            setTimeout(function() { btn.textContent = "\uD83D\uDD0D"; btn.disabled = false; }, 2000);
        })
        .catch(function() { showError("Could not lookup pincode."); btn.textContent = "\uD83D\uDD0D"; btn.disabled = false; });
});

// ===== GET WEATHER BUTTON =====
document.getElementById("loadWeather").addEventListener("click", function() {
    var city = document.getElementById("citySelect").value;
    var btn = document.getElementById("loadWeather");
    btn.textContent = "Loading...";
    btn.disabled = true;
    ["weatherCard","hourlySection","chartSection","healthSection","recipeSection","farmerSection","forecastSection","aqiSection"].forEach(function(id) {
        document.getElementById(id).classList.remove("hidden");
    });

    // Weather
    fetch(API_BASE + "/weather/" + city).then(function(r) { return r.json(); }).then(function(w) {
        document.getElementById("temp").textContent = w.temperature + "\u00B0C";
        document.getElementById("humidity").textContent = w.humidity + "%";
        document.getElementById("condition").textContent = w.condition;
        document.getElementById("wind").textContent = (w.wind || 12) + " km/h";
        var ds = document.getElementById("dataSource");
        if (ds) ds.textContent = "Source: " + (w.source || "imd");
        renderForecast(w.forecast || []); renderFarmerAdvisory(w);
    }).catch(function() { showError("Weather unavailable."); });

    // Hourly
    fetch(API_BASE + "/hourly/" + city).then(function(r) { return r.json(); }).then(function(d) {
        renderHourly(d.hourly || []); renderTempChart(d.hourly || []);
    }).catch(function() {});

    // Health Alerts
    fetch(API_BASE + "/health-alerts/" + city).then(function(r) { return r.json(); }).then(function(alerts) {
        document.getElementById("healthAlerts").innerHTML = alerts.map(function(a) {
            var bc = a.severity==="high"?"#ef4444":a.severity==="medium"?"#f59e0b":"#22c55e";
            var bg = a.severity==="high"?"rgba(239,68,68,0.1)":a.severity==="medium"?"rgba(245,158,11,0.1)":"rgba(34,197,94,0.1)";
            return "<div style=\"display:flex;align-items:center;gap:12px;padding:12px;border-radius:8px;border-left:4px solid " + bc + ";background:" + bg + ";margin-bottom:8px\"><span style=\"font-size:24px\">" + a.icon + "</span><div><strong>" + a.type.toUpperCase() + "</strong><br><small style=\"color:#94a3b8\">" + a.message + "</small></div></div>";
        }).join("");
    }).catch(function() {});

    // Recipes
    fetch(API_BASE + "/recipes/" + city).then(function(r) { return r.json(); }).then(function(rd) {
        var wl = rd.weather || "";
        var cards = rd.recipes.map(function(r) {
            var n = r.name; var e = r.emoji; var t = r.time;
            return "<div class=\"recipe-card-clickable\" onclick=\"openRecipeModal('\" + n + \"')\"><div style=\"font-size:28px;margin-bottom:6px\">" + e + "</div>" + n + "</strong><br><small style=\"color:#64748b\">" + t + "</small><span class=\"recipe-click-hint\">Click for recipe</span></div>";
        }).join("");
        document.getElementById("recipeList").innerHTML = "<div style=\"grid-column:1/-1;text-align:center;margin-bottom:16px;color:#94a3b8\"><strong style=\"color:#e2e8f0\">" + wl + "</strong></div>" + cards;
    }).catch(function() {});

    // AQI
    fetch(API_BASE + "/aqi/" + city).then(function(r) { return r.json(); }).then(function(a) {
        document.getElementById("aqiValue").textContent = a.aqi || "--";
        document.getElementById("aqiCategory").textContent = a.category || "--";
        document.getElementById("aqiAdvice").textContent = a.advice || "--";
        document.getElementById("pm25Value").textContent = a.pm25 || "--";
    }).catch(function() {});

    setTimeout(function() { btn.textContent = "Get Weather"; btn.disabled = false; }, 2000);
});

// ===== WEATHER ICON MAP =====
function getWeatherIcon(condition) {
    var icons = {
        "Sunny": "\u2600\uFE0F",
        "Clear": "\uD83C\uDF19",
        "Cloudy": "\u2601\uFE0F",
        "Overcast": "\u2601\uFE0F",
        "Partly_cloudy": "\u26C5",
        "Partly Cloudy": "\u26C5",
        "Rain": "\uD83C\uDF27\uFE0F",
        "Light_Rain": "\uD83C\uDF26\uFE0F",
        "Heavy_Rain": "\u26C8\uFE0F",
        "Thunderstorm": "\u26C8\uFE0F",
        "Thunderstorm with Hail": "\u26C8\uFE0F",
        "Snow": "\u2744\uFE0F",
        "Fog": "\uD83C\uDF2B\uFE0F",
        "Mist": "\uD83C\uDF2B\uFE0F",
        "Drizzle": "\uD83C\uDF26\uFE0F",
        "Light Drizzle": "\uD83C\uDF26\uFE0F",
        "Moderate Drizzle": "\uD83C\uDF27\uFE0F",
        "Clear Sky": "\u2600\uFE0F"
    };
    return icons[condition] || "\uD83C\uDF24\uFE0F";
}

// ===== RENDER HOURLY =====
function renderHourly(hourlyData) {
    var html = hourlyData.map(function(h) {
        return "<div class=\"hourly-card\">" +
            "<div class=\"hourly-time\">" + h.time + "</div>" +
            "<div class=\"hourly-icon\">" + getWeatherIcon(h.condition) + "</div>" +
            "<div class=\"hourly-temp\">" + h.temp + "\u00B0C</div>" +
            "<div class=\"hourly-cond\">" + h.condition + "</div>" +
            "<div class=\"hourly-hum\">\uD83D\uDCa7 " + h.humidity + "%</div>" +
            "</div>";
    }).join("");
    document.getElementById("hourlyCards").innerHTML = html;
}

// ===== RENDER FORECAST =====
function renderForecast(forecast) {
    var html = forecast.map(function(f) {
        return "<div class=\"forecast-card\">" +
            "<div class=\"forecast-day\">" + f.day + "</div>" +
            "<div class=\"forecast-icon\">" + getWeatherIcon(f.condition) + "</div>" +
            "<div class=\"forecast-temps\">" +
                "<span class=\"forecast-max\">" + f.max + "\u00B0</span>" +
                "<span class=\"forecast-min\">" + f.min + "\u00B0</span>" +
            "</div>" +
            "<div class=\"forecast-cond\">" + f.condition + "</div>" +
            "</div>";
    }).join("");
    document.getElementById("forecastCards").innerHTML = html;
}

// ===== TEMPERATURE CHART (Chart.js) =====
var tempChartInstance = null;
function renderTempChart(hourlyData) {
    if (!hourlyData || hourlyData.length === 0) return;
    var labels = hourlyData.map(function(h) { return h.time; });
    var temps = hourlyData.map(function(h) { return h.temp; });
    var hums = hourlyData.map(function(h) { return h.humidity; });
    var ctx = document.getElementById("tempChart");
    if (!ctx) return;
    if (tempChartInstance) tempChartInstance.destroy();
    tempChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (C)", data: temps,
                borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)",
                fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2
            }, {
                label: "Humidity (%)", data: hums,
                borderColor: "#06b6d4", backgroundColor: "rgba(6,182,212,0.05)",
                fill: false, tension: 0.4, pointRadius: 2, borderWidth: 1.5, borderDash: [4, 4]
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#94a3b8", font: { size: 11 } } },
                tooltip: { backgroundColor: "rgba(15,23,42,0.9)", titleColor: "#e2e8f0", bodyColor: "#94a3b8", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1, cornerRadius: 8, padding: 10 }
            },
            scales: {
                x: { ticks: { color: "#64748b", font: { size: 10 }, maxRotation: 45 }, grid: { color: "rgba(255,255,255,0.04)" } },
                y: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.04)" } }
            }
        }
    });
    document.getElementById("chartSection").classList.remove("hidden");
}

// ===== BROWSER NOTIFICATIONS =====
(function() {
    var btn = document.getElementById("notifBtn");
    if (!btn) return;
    btn.addEventListener("click", function() {
        if (!"Notification" in window) { showError("Notifications not supported."); return; }
        if (Notification.permission === "granted") { showError("Notifications already enabled!"); return; }
        Notification.requestPermission().then(function(perm) {
            if (perm === "granted") {
                showError("Notifications enabled!");
                document.getElementById("errorToast").style.background = "#10b981";
                setTimeout(function() { document.getElementById("errorToast").classList.add("hidden"); document.getElementById("errorToast").style.background = "#ef4444"; }, 2000);
                btn.textContent = "✓";
            } else { showError("Notifications blocked. Enable in browser settings."); }
        });
    });
})();

function sendWeatherNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: body });
    }
}

// ===== FARMER ADVISORY =====
function renderFarmerAdvisory(weather) {
    var advices = [];
    var temp = weather.temperature || 30;
    var humidity = weather.humidity || 50;
    var condition = (weather.condition || "").toLowerCase();
    var wind = weather.wind || 10;

    if (temp > 35) {
        advices.push({ icon: "🚛", title: "Irrigation Alert", text: "High temp. Water crops early morning (5-7 AM) or late evening.", badge: "urgent" });
    } else if (humidity > 80) {
        advices.push({ icon: "💧", title: "Reduce Irrigation", text: "High humidity (" + humidity + "%). Skip irrigation to prevent root rot.", badge: "safe" });
    } else {
        advices.push({ icon: "💨", title: "Normal Irrigation", text: "Weather favorable. Maintain regular irrigation schedule.", badge: "safe" });
    }

    if (condition.indexOf("rain") >= 0 || condition.indexOf("drizzle") >= 0) {
        advices.push({ icon: "☔", title: "Rain Expected", text: "Harvest mature crops immediately. Delay sowing seeds.", badge: "urgent" });
    }
    if (wind > 20) {
        advices.push({ icon: "🌬", title: "High Wind", text: "Wind " + wind + " km/h. Secure tall crops. Avoid spraying pesticides.", badge: "caution" });
    }
    if (temp < 10) {
        advices.push({ icon: "❄", title: "Frost Warning", text: "Temp below 10C. Cover sensitive crops. Irrigate before nightfall.", badge: "urgent" });
    }
    if (temp > 30 && humidity < 40) {
        advices.push({ icon: "☀", title: "Sun Protection", text: "Strong sunlight. Use shade nets. Apply mulching for moisture.", badge: "caution" });
    }
    if (condition.indexOf("clear") >= 0 || condition.indexOf("sunny") >= 0) {
        advices.push({ icon: "🌾", title: "Good Harvest Day", text: "Clear weather. Ideal for harvesting grains and drying crops.", badge: "safe" });
    }
    if (advices.length === 0) {
        advices.push({ icon: "🌱", title: "General Advice", text: "Monitor crops regularly. Ensure proper drainage.", badge: "safe" });
    }

    var html = advices.map(function(a) {
        return "<div class=\"farmer-card\"><div class=\"farmer-card-icon\">" + a.icon + "</div><div><div class=\"farmer-card-title\">" + a.title + "</div><div class=\"farmer-card-text\">" + a.text + "</div><span class=\"farmer-card-badge badge-" + a.badge + "\">" + a.badge + "</span></div></div>";
    }).join("");
    document.getElementById("farmerAdvice").innerHTML = html;
    document.getElementById("farmerSection").classList.remove("hidden");
    var urgent = advices.filter(function(a) { return a.badge === "urgent"; });
    if (urgent.length > 0) {
        sendWeatherNotification("Weather Alert for Farmers", urgent[0].title + ": " + urgent[0].text);
    }
}
// RECIPE DATABASE
var RECIPE_DB = {};

RECIPE_DB['Samosa'] = {emoji: '🍣', time: '25 min', ingredients: '2 cups flour, 3 potatoes boiled, 1 cup peas, 2 tsp cumin, 1 tsp garam masala, 1 tsp amchur, chillies, oil, salt', steps: 'Mix flour/salt/oil into dough. Rest 20 min. Heat oil, add cumin, peas, potatoes, spices. Fill dough cones. Deep fry golden.'};
RECIPE_DB['Sandwich'] = {emoji: '🥪', time: '10 min', ingredients: '4 bread slices, butter, cucumber, tomato, onion, green chutney, salt, pepper', steps: 'Butter bread. Spread chutney. Layer veggies. Sprinkle salt/pepper. Cut diagonally.'};
RECIPE_DB['Fruit Salad'] = {emoji: '🥑', time: '5 min', ingredients: '1 apple diced, 1 banana sliced, 1 cup grapes, 1 cup papaya, 2 tbsp honey, lemon juice, mint', steps: 'Chop fruits. Mix in bowl. Add honey and lemon. Garnish with mint. Serve chilled.'};
RECIPE_DB['Masala Chai'] = {emoji: '🍵', time: '10 min', ingredients: '1 cup water, 1 cup milk, 2 tsp tea, 2 cardamom, ginger crushed, 2 cloves, sugar', steps: 'Boil water with spices. Add tea, simmer 2 min. Add milk and sugar. Boil. Strain. Serve hot.'};
RECIPE_DB['Aloo Pakora'] = {emoji: '🥞', time: '20 min', ingredients: '2 potatoes sliced, 1 cup besan, chilli powder, turmeric, salt, oil', steps: 'Make besan batter with spices. Dip potatoes. Deep fry until golden. Serve with chutney.'};
RECIPE_DB['Maggi'] = {emoji: '🍜', time: '5 min', ingredients: '1 Maggi packet, 2 cups water, tastemaker, onion chopped, chilli chopped, butter', steps: 'Boil water. Add tastemaker and veggies. Add noodles. Cook 2 min. Serve hot with butter.'};
RECIPE_DB['Aam Panna'] = {emoji: '🥭', time: '15 min', ingredients: '2 raw mangoes, 1 cup sugar, cumin powder, black salt, mint, 4 cups water', steps: 'Boil mangoes, scoop pulp. Blend with sugar and spices. Add water. Strain. Serve over ice.'};
RECIPE_DB['Thandai'] = {emoji: '🥛', time: '10 min', ingredients: '2 cups milk, sugar, 10 almonds, 10 cashews, fennel seeds, black pepper', steps: 'Soak nuts 2 hrs. Blend with milk. Strain. Mix with remaining milk and sugar. Serve ice cold.'};
RECIPE_DB['Nimbu Pani'] = {emoji: '🍋', time: '5 min', ingredients: '2 lemons, 4 cups water, 4 tbsp sugar, black salt, cumin powder, mint', steps: 'Squeeze lemons in jug. Add sugar, salt, cumin. Add water. Stir. Serve with ice and mint.'};
RECIPE_DB['Gajar Ka Halwa'] = {emoji: '🥕', time: '30 min', ingredients: '4 cups grated carrots, 4 cups milk, half cup sugar, 2 tbsp ghee, cardamom, cashews', steps: 'Boil carrots in milk until reduced. Add sugar, cardamom, ghee. Cook 5 min. Garnish cashews.'};
RECIPE_DB['Hot Soup'] = {emoji: '🍲', time: '20 min', ingredients: '1 cup mixed veggies, 2 cups broth, butter, cornflour, pepper, salt', steps: 'Saute veggies in butter. Add broth. Mix cornflour in water, add. Simmer. Season. Serve.'};
RECIPE_DB['Chai + Biscuit'] = {emoji: '🥒', time: '10 min', ingredients: '1 cup water, 1 cup milk, 2 tsp tea, sugar, your favorite biscuits', steps: 'Boil water with tea. Add milk and sugar. Strain. Grab biscuits. Dip. Sip. Enjoy.'};

// ===== RECIPE MODAL FUNCTIONS =====
function openRecipeModal(name) {
    var r = RECIPE_DB[name];
    if (!r) { window.open("https://www.google.com/search?q=best+" + name.replace(/\s+/g, "+") + "+recipe", "_blank"); return; }
    document.getElementById("recipeModalEmoji").textContent = r.emoji;
    document.getElementById("recipeModalName").textContent = name;
    document.getElementById("recipeModalTime").textContent = r.time;
    document.getElementById("recipeModalIngredients").innerHTML = r.ingredients.split(", ").map(function(x){return "<li>" + x + "</li>";}).join("");
    document.getElementById("recipeModalSteps").innerHTML = r.steps.split(". ").filter(function(s){return s.length>0;}).map(function(x){return "<li>" + x + (x.slice(-1)==="." ? "" : ".") + "</li>";}).join("");
    document.getElementById("recipeModalLink").href = "https://www.youtube.com/results?search_query=best+" + name.replace(/\s+/g, "+") + "+recipe";
    document.getElementById("recipeModalGoogle").href = "https://www.google.com/search?q=best+" + name.replace(/\s+/g, "+") + "+recipe";
    document.getElementById("recipeModal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeRecipeModal() {
    document.getElementById("recipeModal").classList.add("hidden");
    document.body.style.overflow = "";
}

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeRecipeModal();
});
