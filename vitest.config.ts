import { defineConfig } from "vitest/config";

// Unit tests only cover server actions and utilities (not React components),
// so the default `node` environment is all we need.
export default defineConfig({
  resolve: {
    // Resolve the `@/*` path alias from tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: true,
  },
});
