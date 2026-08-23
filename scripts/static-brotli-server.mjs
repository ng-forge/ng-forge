/**
 * Static server with brotli/gzip negotiation, so Lighthouse measures the transfer sizes a
 * real host serves rather than uncompressed files.
 *
 * Usage: node scripts/static-brotli-server.mjs <dir> <port>
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const ROOT = process.argv[2];
const PORT = Number(process.argv[3] ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const COMPRESSIBLE = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg']);
const cache = new Map();

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const rel = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, rel === '/' ? 'index.html' : rel);

  let body;
  try {
    body = await readFile(file);
  } catch {
    file = join(ROOT, 'index.html');
    body = await readFile(file);
  }

  const ext = extname(file);
  const accept = req.headers['accept-encoding'] ?? '';
  let encoding = null;
  if (COMPRESSIBLE.has(ext)) {
    if (/\bbr\b/.test(accept)) encoding = 'br';
    else if (/\bgzip\b/.test(accept)) encoding = 'gzip';
  }

  if (encoding) {
    const key = `${file}:${encoding}`;
    if (!cache.has(key)) {
      cache.set(
        key,
        encoding === 'br' ? brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }) : gzipSync(body, { level: 9 }),
      );
    }
    body = cache.get(key);
  }

  res.writeHead(200, {
    'content-type': TYPES[ext] ?? 'application/octet-stream',
    'content-length': body.length,
    ...(encoding ? { 'content-encoding': encoding, vary: 'Accept-Encoding' } : {}),
    'cache-control': 'no-store',
  });
  res.end(body);
}).listen(PORT, () => console.log(`serving ${ROOT} on ${PORT}`));
