/**
 * Production-parity static server for performance measurement.
 *
 * WHY THIS EXISTS
 * ---------------
 * `npm start` runs `dist/index.js` — the Express app. That app is **not what
 * production runs**. `.github/workflows/deploy.yml:87-91` deploys with
 * `rsync -avz --delete dist/public/ …:~/public_html/`, so production is
 * Apache on HostGator serving the contents of `dist/public/` as plain files,
 * configured by the `.htaccess` that ships inside that directory. No Express,
 * no tRPC middleware, and — critically — `mod_deflate` compression.
 *
 * Measuring Lighthouse against the Express server therefore measures the
 * wrong server: it serves every asset uncompressed, so Lighthouse's Lantern
 * simulator is fed transfer sizes 3-4x larger than a visitor ever downloads,
 * and every network-bound metric (FCP, LCP, Speed Index) is inflated.
 *
 * WHAT THIS REPRODUCES, AND HOW IT WAS CALIBRATED
 * -----------------------------------------------
 * Compression is not "gzip -6". Measured against the live host on 2026-09-06
 * by fetching each URL twice, once with `Accept-Encoding: identity` and once
 * with `Accept-Encoding: gzip`, and comparing the compressed transfer size to
 * a local `gzip -6` of the identical bytes:
 *
 *   URL                            raw      Apache gz   gzip -6    ratio
 *   /                           368,987      135,591    105,593    1.284
 *   /assets/index-C6yZOK4E.js 1,356,584      470,725    334,232    1.408
 *   /assets/index-DLLIE91u.css  148,403       31,581     23,511    1.343
 *
 * Real Apache on this host emits 28-41% MORE bytes than `gzip -6` for the
 * same input, so Vite's printed "gzip:" figures understate the real download.
 * A parameter sweep over zlib level x windowBits x memLevel against those
 * three measured targets found one configuration reproducing all three within
 * 1.05%: level 6, windowBits 10, memLevel 7. Those are the settings below.
 *
 * Everything else mirrors `.htaccess` in this repo, by line:
 *   - `.htaccess:29-31`   SPA fallback to index.html for non-file requests
 *   - `.htaccess:34-52`   the six security headers
 *   - `.htaccess:59-62`   AddType model/vnd.usdz+zip .usdz
 *   - `.htaccess:65-84`   ExpiresByType -> Cache-Control max-age
 *   - `.htaccess:87-96`   the mod_deflate AddOutputFilterByType list
 *
 * WHAT IT CANNOT REPRODUCE (stated, not hidden)
 * ---------------------------------------------
 *   - Production is HTTP/2 over TLS; this is HTTP/1.1 plaintext on localhost.
 *   - Production has real WAN latency; localhost has none. Lighthouse's
 *     `simulate` throttling method supplies the modelled RTT itself, so this
 *     matters far less than it would for an observed-throttling run, but it
 *     is not nothing.
 *   - Google Fonts is fetched from its real origin in both cases, so a run
 *     depends on this machine's internet access.
 *
 * Usage: node scripts/serve-static.mjs <port> [root]
 */
import { createServer } from "node:http";
import { gzipSync } from "node:zlib";
import { readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Calibrated to the live host — see the header comment for the measurements. */
export const APACHE_GZIP = { level: 6, windowBits: 10, memLevel: 7 };

/** `.htaccess:59-62` plus the types Apache already knows for this output. */
const MIME = {
  ".html": "text/html; charset=UTF-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".glb": "model/gltf-binary",
  ".usdz": "model/vnd.usdz+zip",
};

/**
 * `.htaccess:88-95`. Compared on the bare type, without the charset
 * parameter, exactly as Apache's AddOutputFilterByType matches.
 */
const DEFLATE_TYPES = new Set([
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
  "application/json",
  "image/svg+xml",
  "font/woff2",
  "font/woff",
]);

/** `.htaccess:65-84`. HTML is "access plus 0 seconds"; hashed assets 1 year. */
const ONE_YEAR = 31536000;
const MAX_AGE = {
  "text/html": 0,
  "text/javascript": ONE_YEAR,
  "application/javascript": ONE_YEAR,
  "text/css": ONE_YEAR,
  "image/png": ONE_YEAR,
  "image/jpeg": ONE_YEAR,
  "image/gif": ONE_YEAR,
  "image/svg+xml": ONE_YEAR,
  "image/webp": ONE_YEAR,
  "image/x-icon": ONE_YEAR,
  "font/woff2": ONE_YEAR,
  "font/woff": ONE_YEAR,
};

/** `.htaccess:34-52`. */
const SECURITY_HEADERS = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
};

/** file path -> { body, gzip, type } — compressing 366 kB of HTML per request
 *  would make the harness, not the site, the thing being measured. */
const cache = new Map();

function loadFile(filePath, type) {
  const hit = cache.get(filePath);
  if (hit) return hit;
  const body = readFileSync(filePath);
  const bare = type.split(";")[0].trim();
  const entry = {
    body,
    type,
    gzip: DEFLATE_TYPES.has(bare) ? gzipSync(body, APACHE_GZIP) : null,
  };
  cache.set(filePath, entry);
  return entry;
}

function resolveTarget(root, urlPath) {
  // Reject traversal before touching the filesystem.
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const candidate = resolve(join(root, clean));
  if (candidate !== root && !candidate.startsWith(root + "/")) return null;

  try {
    const st = statSync(candidate);
    if (st.isFile()) return candidate;
    if (st.isDirectory()) {
      const index = join(candidate, "index.html");
      if (statSync(index).isFile()) return index;
    }
  } catch {
    /* falls through to the SPA rewrite below */
  }
  // `.htaccess:29-31`: !-f && !-d  ->  index.html
  return join(root, "index.html");
}

export function createStaticServer(root) {
  const absRoot = resolve(root);
  return createServer((req, res) => {
    const target = resolveTarget(absRoot, req.url ?? "/");
    if (!target) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    let entry;
    try {
      const type = MIME[extname(target).toLowerCase()] ?? "application/octet-stream";
      entry = loadFile(target, type);
    } catch (err) {
      res.writeHead(404, { "Content-Type": "text/plain" }).end(`Not found: ${req.url}`);
      return;
    }

    const bare = entry.type.split(";")[0].trim();
    const headers = { ...SECURITY_HEADERS, "Content-Type": entry.type, Vary: "Accept-Encoding" };
    if (bare in MAX_AGE) headers["Cache-Control"] = `max-age=${MAX_AGE[bare]}`;

    const wantsGzip = /\bgzip\b/.test(req.headers["accept-encoding"] ?? "");
    const payload = entry.gzip && wantsGzip ? entry.gzip : entry.body;
    if (entry.gzip && wantsGzip) headers["Content-Encoding"] = "gzip";
    headers["Content-Length"] = String(payload.length);

    res.writeHead(200, headers);
    if (req.method === "HEAD") res.end();
    else res.end(payload);
  });
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const port = Number(process.argv[2]);
  const root = process.argv[3] ?? join(REPO_ROOT, "dist", "public");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Usage: node scripts/serve-static.mjs <port> [root]");
    process.exit(2);
  }
  createStaticServer(root).listen(port, () => {
    console.log(`Static production-parity server on http://localhost:${port}/ (root: ${root})`);
  });
}
