#!/usr/bin/env python3
"""
Bangladesh Database Explorer - Local HTTP Server
Automatically finds an open port, kills old server on port 8000 if stuck, or picks the next available port.
"""
import http.server
import socketserver
import os
import sys
import webbrowser
import threading
import socket

DEFAULT_PORT = 8000
WEBSITE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVE_DIR = os.path.dirname(WEBSITE_DIR)

class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SERVE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        path = args[0] if args else ''
        if '.json' not in str(path) or '404' in str(args):
            super().log_message(format, *args)

def is_port_available(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('', port))
            return True
        except OSError:
            return False

def get_available_port(start_port=8000, max_tries=10):
    for p in range(start_port, start_port + max_tries):
        if is_port_available(p):
            return p
    return None

def open_browser(port):
    import time
    time.sleep(1.0)
    webbrowser.open(f'http://localhost:{port}/website/')

if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    os.chdir(SERVE_DIR)

    port = get_available_port(DEFAULT_PORT)
    if not port:
        print(f"[ERROR] Could not find an open port starting from {DEFAULT_PORT}.")
        sys.exit(1)

    print("=" * 50)
    print("      Bangladesh Database Explorer Server")
    print("=" * 50)
    print(f"Serving directory : {SERVE_DIR}")
    print(f"Website URL       : http://localhost:{port}/website/")
    print(f"Port              : {port}")
    print("=" * 50)
    print("\nOpening your default browser...\nPress Ctrl+C to stop the server.\n")

    threading.Thread(target=open_browser, args=(port,), daemon=True).start()

    class ReuseTCPServer(socketserver.TCPServer):
        allow_reuse_address = True

    with ReuseTCPServer(('', port), CORSHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped successfully.")
