import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    // Test-only placeholders so server/contactRouter.ts's env check passes
    // and its mocked-fetch tests exercise the real request-building path.
    // Not real credentials — never a live Supabase project.
    env: {
      SUPABASE_URL: "https://test-project.supabase.co",
      SUPABASE_SERVICE_KEY: "test-placeholder-service-key",
    },
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}", "server/**/*.test.ts"],
    reporter: ["verbose", "json"],
    outputFile: {
      json: "../test-results/vitest-results.json",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
