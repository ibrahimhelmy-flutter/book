/**
 * Minimal static server for the `out/` export, mounted under BASE_PATH (default `/book`)
 * exactly like GitHub Pages. Used by Playwright e2e and manual smoke tests.
 *
 *   BASE_PATH=/book PORT=3001 node scripts/test-static-server.mjs
 */
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = Number(process.env.PORT || 3001);
const BASE_PATH = (process.env.BASE_PATH ?? '/book').replace(/\/$/, '');
const STATIC_DIR = path.resolve(process.env.STATIC_DIR || 'out');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/x-component; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

function resolveFile(reqPath) {
  let filePath = path.join(STATIC_DIR, reqPath);
  if (!filePath.startsWith(STATIC_DIR)) return null;
  if (reqPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return filePath;
  if (fs.existsSync(filePath + '.html')) return filePath + '.html';
  const asDir = path.join(filePath, 'index.html');
  if (fs.existsSync(asDir)) return asDir;
  return null;
}

function send(res, status, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(status, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let reqPath = decodeURIComponent(url.pathname);

  if (BASE_PATH) {
    if (reqPath === BASE_PATH) {
      res.writeHead(301, { Location: `${BASE_PATH}/` });
      return res.end();
    }
    if (!reqPath.startsWith(`${BASE_PATH}/`)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not Found (outside base path)');
    }
    reqPath = reqPath.slice(BASE_PATH.length);
  }

  const filePath = resolveFile(reqPath);
  if (filePath) return send(res, 200, filePath);

  const notFound = path.join(STATIC_DIR, '404.html');
  if (fs.existsSync(notFound)) return send(res, 404, notFound);
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Static server: http://127.0.0.1:${PORT}${BASE_PATH}/  (serving ${STATIC_DIR})`);
});
