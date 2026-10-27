import base64

with open("frontend/js/app.js", "r", encoding="utf-8") as f:
    orig = f.read()

lines = orig.split(chr(10))
before = lines[:108]
after = lines[115:]

# Build new recipe section using chr() to avoid escaping issues
H = chr(60)
G = chr(62)
Q = chr(34)
BS = chr(92)

new_section = []new_section.append("    // Recipes")
new_section.append("    fetch(API_BASE + " + Q + "/recipes/" + Q + " + city).then(function(r) { return r.json(); }).then(function(rd) {")
new_section.append("        var wl = rd.weather || " + Q + Q + ";")
new_section.append("        var cards = rd.recipes.map(function(r) {")
new_section.append("            var n = r.name; var e = r.emoji; var t = r.time;")
