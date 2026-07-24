const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 4184;
const host = "0.0.0.0";
const teacherNotebookPreviewPath = "/teacher-notebook-preview";
const teacherNotebookPreviewBootstrap = `    <script>
      window.SUIYOUKAI_TEACHER_NOTEBOOK_PREVIEW = Object.freeze({
        enabled: true
      });
    </script>
`;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const createLocalMobileServer = ({ rootDir = root } = {}) => http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const isTeacherNotebookPreview = url.pathname === teacherNotebookPreviewPath;
  const pathname = isTeacherNotebookPreview
    ? "/teacher-notebook.html"
    : url.pathname === "/"
      ? "/index.html"
      : url.pathname;
  const requestedPath = decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(rootDir, requestedPath));

  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    let body = data;
    if (isTeacherNotebookPreview) {
      const html = data.toString("utf8");
      const scriptTagPattern = /(\s*<script src="teacher-notebook\.js[^"]*"><\/script>)/;
      if (!scriptTagPattern.test(html)) {
        response.writeHead(500);
        response.end("Preview bootstrap target not found");
        return;
      }
      body = Buffer.from(html.replace(
        scriptTagPattern,
        `${teacherNotebookPreviewBootstrap}$1`
      ), "utf8");
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      ...(isTeacherNotebookPreview ? { "Cache-Control": "no-store" } : {}),
    });
    response.end(body);
  });
});

if (require.main === module) {
  createLocalMobileServer().listen(port, host);
}

module.exports = {
  createLocalMobileServer,
  teacherNotebookPreviewPath,
};
