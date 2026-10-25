import { defaultClientConditions } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { conditions: ["@evolve/source", ...defaultClientConditions] },
  ssr: { resolve: { conditions: ["@evolve/source"] } },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
