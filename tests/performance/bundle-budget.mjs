/**
 * PERFORMANCE — bundle byte budgets
 * Category: Performance Testing (test matrix #7)
 *
 * Measures the built output in `dist/public` in the two units that matter and
 * compares them to `budget.json`.
 *
 * TWO UNITS, BOTH REPORTED, ONE ENFORCED
 * --------------------------------------
 *   gzip-6   — what `vite build` prints in its "gzip:" column, and the unit
 *              the 257.08 kB baseline in TASKS.md is denominated in. Portable
 *              and reproducible with `gzip -6`.
 *   prod     — what production actually puts on the wire. Apache's mod_deflate
 *              on the deploy host does NOT emit `gzip -6` bytes: measured
 *              against safecodeg.com on 2026-09-06 it emits 1.284x (HTML),
 *              1.343x (CSS) and 1.408x (JS) as many bytes for byte-identical
 *              input. `scripts/serve-static.mjs` documents that measurement
 *              and pins the zlib settings that reproduce all three within
 *              1.05%; this module uses the same settings.
 *
 * The gate enforces `prod`, because that is the number a visitor pays for.
 * `gzip-6` is printed beside it so the figure reconciles with Vite's output.
 * Both are deterministic: zlib output is fixed for fixed parameters and fixed
 * input, so neither number varies by machine.
 */
import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { APACHE_GZIP } from "../../scripts/serve-static.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(HERE, "../..");
export const DIST_DIR = join(REPO_ROOT, "dist", "public");
export const BUDGET_PATH = join(HERE, "budget.json");

/** Chunk name prefixes that must never be requested by a non-/dimensions route.
 *  Named in vite.config.ts's manualChunks precisely so this match is stable
 *  across content-hash changes (ARCHITECTURE-DIMENSIONS.md §9.5). */
export const LAZY_CHUNK_PREFIXES = [
  "vendor-three-",
  "vendor-physics-",
  "vendor-collab-",
  "DimensionsStage-",
  "sandbox-",
];

export function loadBudget() {
  return JSON.parse(readFileSync(BUDGET_PATH, "utf8"));
}

function sizes(buf) {
  return {
    raw: buf.length,
    gzip6: gzipSync(buf, { level: 6 }).length,
    prod: gzipSync(buf, APACHE_GZIP).length,
  };
}

/**
 * Finds the entry script and stylesheet by reading them out of the built
 * index.html rather than by guessing at filenames — content hashes change on
 * every source edit, and a budget keyed to a hash silently stops measuring
 * anything the first time the code changes.
 */
function readEntryRefs(html) {
  const script = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/);
  const style =
    html.match(/<link[^>]+rel="stylesheet"[^>]+href="(\/assets\/[^"]+)"/) ??
    html.match(/<link[^>]+href="(\/assets\/[^"]+\.css)"[^>]*rel="stylesheet"/);
  if (!script)
    throw new Error(
      'index.html has no <script type="module"> — cannot identify the entry chunk'
    );
  if (!style)
    throw new Error(
      'index.html has no local <link rel="stylesheet"> — cannot identify the entry CSS'
    );
  return { script: script[1], style: style[1] };
}

export function measureBundle(distDir = DIST_DIR) {
  const htmlPath = join(distDir, "index.html");
  if (!statSync(htmlPath).isFile())
    throw new Error(`No built index.html at ${htmlPath} — run npm run build`);
  const htmlBuf = readFileSync(htmlPath);
  const html = htmlBuf.toString("utf8");
  const { script, style } = readEntryRefs(html);

  const entryJs = sizes(readFileSync(join(distDir, script.replace(/^\//, ""))));
  const entryCss = sizes(readFileSync(join(distDir, style.replace(/^\//, ""))));
  const document = sizes(htmlBuf);

  const criticalPath = {
    raw: document.raw + entryJs.raw + entryCss.raw,
    gzip6: document.gzip6 + entryJs.gzip6 + entryCss.gzip6,
    prod: document.prod + entryJs.prod + entryCss.prod,
  };

  // Every emitted chunk, for the "lives outside the entry chunk" evidence
  // T-015 asks for by filename.
  const assetsDir = join(distDir, "assets");
  const chunks = readdirSync(assetsDir)
    .filter(f => f.endsWith(".js") || f.endsWith(".css"))
    .sort()
    .map(f => ({ file: f, ...sizes(readFileSync(join(assetsDir, f))) }));

  return {
    entryScript: script,
    entryStylesheet: style,
    groups: { document, entryJs, entryCss, criticalPath },
    chunks,
  };
}

// kB = 1000 bytes, matching what `vite build` prints and the 257.08 / 270 kB
// figures already recorded in TASKS.md. Not KiB.
const kb = n => (n / 1000).toFixed(2) + " kB";

/**
 * @returns {{failures: string[], lines: string[]}} — failures is empty when
 * every budgeted group is at or under its ceiling.
 */
export function checkBundleBudget(measurement, budget) {
  const failures = [];
  const lines = [];
  lines.push(
    "Bundle bytes (prod = Apache-calibrated transfer; gzip6 = what vite build prints)"
  );
  lines.push(
    "  " +
      "group".padEnd(16) +
      "prod".padStart(12) +
      "ceiling".padStart(12) +
      "headroom".padStart(12) +
      "gzip6".padStart(12) +
      "raw".padStart(12)
  );

  for (const [name, limit] of Object.entries(budget.budgets.bytes)) {
    const g = measurement.groups[name];
    if (!g) {
      failures.push(
        `budget.json names byte group "${name}", which the build does not produce`
      );
      continue;
    }
    const over = g.prod > limit.ceilingBytes;
    lines.push(
      "  " +
        name.padEnd(16) +
        kb(g.prod).padStart(12) +
        kb(limit.ceilingBytes).padStart(12) +
        kb(limit.ceilingBytes - g.prod).padStart(12) +
        kb(g.gzip6).padStart(12) +
        kb(g.raw).padStart(12) +
        (over ? "   <== OVER" : "")
    );
    if (over) {
      failures.push(
        `${name}: ${g.prod} B production transfer exceeds the ${limit.ceilingBytes} B ceiling ` +
          `by ${g.prod - limit.ceilingBytes} B (${kb(g.prod - limit.ceilingBytes)}). ` +
          `Baseline was ${limit.baselineBytes} B.`
      );
    }
  }

  lines.push("");
  lines.push("Emitted chunks:");
  for (const c of measurement.chunks) {
    const lazy = LAZY_CHUNK_PREFIXES.some(p => c.file.startsWith(p));
    lines.push(
      `  ${c.file.padEnd(34)} ${kb(c.prod).padStart(11)} prod  ${kb(c.gzip6).padStart(11)} gzip6  ${lazy ? "[lazy]" : ""}`
    );
  }

  return { failures, lines };
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const m = measureBundle();
  const { failures, lines } = checkBundleBudget(m, loadBudget());
  console.log(lines.join("\n"));
  if (failures.length) {
    console.error("\nBundle budget FAILED:\n  - " + failures.join("\n  - "));
    process.exit(1);
  }
  console.log("\nBundle budget: PASS");
}
