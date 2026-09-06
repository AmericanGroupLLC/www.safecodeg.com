/**
 * Build the app, serve it on a dedicated port, run a command against it, and
 * always tear the server down again.
 *
 * The audit scripts under tests/security and tests/performance previously
 * pointed at a hard-coded Manus sandbox URL that now returns 502. Nothing
 * started a server for them, so one script audited an error page and reported
 * a clean result, and the other hung until the gate's timeout.
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

const server = spawn("node", ["dist/index.js"], {
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
