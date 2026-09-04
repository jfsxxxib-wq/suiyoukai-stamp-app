from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from urllib.parse import unquote,urlsplit
root=Path(__file__).resolve().parents[2]
source=root/'work'/'flower-production-20260904'
preview=Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        clean=unquote(urlsplit(path).path).lstrip('/') or 'index.html'
        if '..' in Path(clean).parts:return str(preview/'missing')
        return str(preview/'index.html') if clean=='index.html' else str(source/clean)
ThreadingHTTPServer(('127.0.0.1',4194),Handler).serve_forever()
