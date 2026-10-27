import base64, os

# Read original file
with open("frontend/js/app.js", "r", encoding="utf-8") as f:
    orig = f.read()

# Find recipe section boundaries
lines = orig.split(chr(10))
rs = -1
re = -1
for i, l in enumerate(lines):
    if "// Recipes" in l and rs < 0: rs = i
    if "// AQQ" in l and rs >= 0 and re < 0: re = i; break

print(f"Found recipe section at lines {rs} to {re}")