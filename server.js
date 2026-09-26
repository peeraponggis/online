const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const PORT = Number(process.argv[2]) || 8000;

const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg' };

const base = { 'X-Content-Type-Options': 'nosniff' };
const text = { ...base, 'Content-Type': 'text/plain; charset=utf-8' };
const badRequest = res => { res.writeHead(400, text); res.end('400 Bad Request'); };

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { ...text, 'Allow': 'GET, HEAD' });
    return res.end('405 Method Not Allowed');
  }

  let clean;
  try {
    clean = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    return badRequest(res);
  }
  if (clean.indexOf('\u0000') !== -1) return badRequest(res);

  const file = path.resolve(ROOT, '.' + (clean === '/' ? '/index.html' : clean));
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
    res.writeHead(403, text);
    return res.end('403 Forbidden');
  }

  fs.stat(file, (err, st) => {
    const target = !err && st.isDirectory() ? path.join(file, 'index.html') : file;
    fs.readFile(target, (e, buf) => {
      if (e) {
        res.writeHead(404, text);
        return res.end('404 Not Found: ' + clean);
      }
      res.writeHead(200, {
        ...base,
        'Content-Type': TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream',
        'Content-Length': buf.length,
      });
      res.end(req.method === 'HEAD' ? undefined : buf);
    });
  });
}).listen(PORT, '127.0.0.1', () => console.log('READY http://localhost:' + PORT));
