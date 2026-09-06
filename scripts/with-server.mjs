/**
 * Build the app, serve it on a dedicated port, run a command against it, and
 * always tear the server down again.
 *
 * The audit scripts under tests/security and tests/performance previously
 * pointed at a hard-coded Manus sandbox URL that now returns 502. Nothing
 * started a server for them, so one script audited an error page and reported
 * a clean result, and the other hung until the gate's timeout.
 *
 * Two servers are available, because the two audits need different things:
 *
 *   default (WITH_SERVER_MODE unset or "app")
 *     `node dist/index.js` — the Express app. What the security audit wants:
 *     it exercises the tRPC routes and the storage proxy.
 *
 *   WITH_SERVER_MODE=static
 *     `node scripts/serve-static.mjs` — Apache-parity static serving of
 *     dist/public. What the performance audit wants, because that is what
 *     production actually is: deploy.yml:87-91 rsyncs dist/public to Apache
 *     and deploys no Node process at all. Express serves every asset
 *     uncompressed, which inflated every network-bound Lighthouse metric.
 *
 * Usage: node scripts/with-server.mjs <port> <command> [...args]
 */
import { spawn } from "child_process";
import { setTimeout as sleep } from "timers/promises";

const [, , portArg, ...command] = process.argv;
const port = Number(portArg);

if (!Number.isInteger(port) || command.length === 0) {
  console.error("Usage: node scripts/with-server.mjs <port> <command> [...args]");
  process.exit(2);
}

const run = (cmd, args, opts = {}) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", ...opts });
    child.on("error", reject);
    child.on("exit", code => resolvePromise(code ?? 1));
  });

async function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(url);
      return true;
    } catch {
      await sleep(300);
    }
  }
  return false;
}

const buildCode = await run("npm", ["run", "build"]);
if (buildCode !== 0) process.exit(buildCode);

const mode = process.env.WITH_SERVER_MODE ?? "app";
if (mode !== "app" && mode !== "static") {
  console.error(`WITH_SERVER_MODE must be "app" or "static", got "${mode}"`);
  process.exit(2);
}

const server =
  mode === "static"
    ? spawn("node", ["scripts/serve-static.mjs", String(port)], { stdio: "inherit", env: process.env })
    : spawn("node", ["dist/index.js"], {
        stdio: "inherit",
        env: { ...process.env, NODE_ENV: "production", PORT: String(port) },
      });

let exitCode = 1;
try {
  const base = `http://localhost:${port}`;
  if (!(await waitForServer(base))) {
    console.error(`Server did not become ready on ${base} within 60s`);
    process.exit(1);
  }
  exitCode = await run(command[0], command.slice(1), {
    env: { ...process.env, AUDIT_BASE_URL: base },
  });
} finally {
  server.kill("SIGTERM");
}

process.exit(exitCode);
