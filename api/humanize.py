import json
from http.server import BaseHTTPRequestHandler
import sys
import os

# Ensure the root directory is in the path so we can import studentvibe
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import studentvibe

def load_config():
    config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config.json")
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)

# Load config once on cold start
CONFIG = load_config()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Empty request body"}).encode())
            return
            
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(post_data)
            text = data.get("text", "")
            persona = data.get("persona", "College")
            
            if persona not in CONFIG:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Persona '{persona}' not found"}).encode())
                return
                
            engine = studentvibe.HumanizerEngine(CONFIG[persona])
            processed_text = engine.process(text)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            # CORS headers just in case
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            self.wfile.write(json.dumps({
                "original": text,
                "humanized": processed_text,
                "persona": persona
            }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
