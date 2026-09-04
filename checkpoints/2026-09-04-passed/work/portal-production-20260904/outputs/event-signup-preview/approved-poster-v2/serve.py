from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote,urlsplit
folder=Path(__file__).resolve().parent
assets=folder.parents[1]/'public'
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        name=unquote(urlsplit(path).path).lstrip('/')
        if name in ('','index.html'): return str(folder/'index.html')
        if name=='poster-sample.jpg': return str(folder/'poster-sample.jpg')
        if name.startswith('public/'):
            target=(assets/name.removeprefix('public/')).resolve()
            if target.is_relative_to(assets.resolve()): return str(target)
        return str(folder/'missing')
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'none'")
        super().end_headers()
print('Event signup preview: http://127.0.0.1:4196/',flush=True)
ThreadingHTTPServer(('127.0.0.1',4196),Handler).serve_forever()
