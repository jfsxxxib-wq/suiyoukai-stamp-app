from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit,unquote
folder=Path(__file__).resolve().parent
site=folder.parents[1]
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if urlsplit(self.path).path=='/api/registration':
            self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(b'{"registered":false}');return
        super().do_GET()
    def translate_path(self,path):
        clean=unquote(urlsplit(path).path).lstrip('/') or 'index.html'
        if '..' in Path(clean).parts:return str(folder/'missing')
        return str(folder/'index.html') if clean in ['index.html','preview'] else str(site/clean)
print('Schedule preview: http://127.0.0.1:4195/',flush=True)
ThreadingHTTPServer(('127.0.0.1',4195),Handler).serve_forever()
