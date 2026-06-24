#!/usr/bin/env python3
"""
Local background-removal server for testing Closet's "beautify" before the on-device iOS build.

Free + private: the rembg model runs on YOUR machine; photos never go to a third party. The app
POSTs an image and gets back a clean cut-out composited on a white background.

Setup (on the machine you'll run this on — e.g. your home desktop):
    python3 -m venv venv
    source venv/bin/activate          # Windows: venv\\Scripts\\activate
    pip install "rembg[cpu]" pillow flask flask-cors
    python scripts/beautify-server.py

Then point the app at it. Find this machine's LAN IP (e.g. 192.168.1.50) and put in .env:
    EXPO_PUBLIC_BEAUTIFY_URL=http://192.168.1.50:7000/remove
Restart `expo start` after editing .env. The iPhone (Expo Go) and this machine must be on the
same network. The contract: POST { "image": <data-url|base64> } -> { "image": <data-url> }.
"""
import base64
import io

from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
from rembg import remove

app = Flask(__name__)
CORS(app)


def to_data_url(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


@app.post("/remove")
def remove_bg():
    payload = request.get_json(force=True)
    raw = payload.get("image", "")
    if "," in raw:  # strip a data-url prefix if present
        raw = raw.split(",", 1)[1]

    src = Image.open(io.BytesIO(base64.b64decode(raw))).convert("RGBA")
    cutout = remove(src)  # transparent background
    white = Image.new("RGBA", cutout.size, (255, 255, 255, 255))
    flat = Image.alpha_composite(white, cutout).convert("RGB")
    return jsonify({"image": to_data_url(flat)})


@app.get("/health")
def health():
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7000)
