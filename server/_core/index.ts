import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // An explicitly requested PORT is honoured exactly, or the server fails
  // loudly. Silently drifting to another port makes the process unreachable
  // at the address the caller was told to use — which is how concurrent
  // Playwright suites ended up killing each other's server (each spawned one,
  // the later ones drifted to 3001+, and every suite polled 3000).
  // With PORT unset, the original scan is kept as a local-dev convenience.
  const requestedPort = process.env.PORT;
  let port: number;

  if (requestedPort) {
    port = parseInt(requestedPort, 10);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(
        `PORT is set to "${requestedPort}", which is not a valid port number.`
      );
    }
    if (!(await isPortAvailable(port))) {
      throw new Error(
        `PORT=${port} was requested but is already in use. ` +
          `Refusing to start on a different port — free it, or set a different PORT.`
      );
    }
  } else {
    const preferredPort = 3000;
    port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(err => {
  // Exit non-zero so a failed start is a visible failure rather than a
  // process that logs and then lingers with nothing listening.
  console.error(err);
  process.exit(1);
});
