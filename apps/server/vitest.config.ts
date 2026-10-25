import { defineConfig } from "vitest/config";

export default defineConfig({
  // Lit les sources TypeScript de @evolve/shared plutôt que son build.
  resolve: { conditions: ["@evolve/source"] },
  ssr: { resolve: { conditions: ["@evolve/source"] } },
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 15_000,
  },
});
