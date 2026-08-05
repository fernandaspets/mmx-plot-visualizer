#!/usr/bin/env python3
"""Simple HTTP server for MMX Plot Visualizer."""
import http.server
import socketserver

socketserver.TCPServer.allow_reuse_address = True
import sys
import os

PORT = 8765
DIR = os.path.dirname(os.path.abspath(__file__))

os.chdir(DIR)

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    with socketserver.TCPServer(("0.0.0.0", port), Handler) as httpd:
        print(f"⚡ MMX Plot Visualizer serving on http://localhost:{port}")
        print(f"   Open in browser: http://localhost:{port}")
        httpd.serve_forever()
