import { defaultClientConditions, defineConfig } from "vite";

export default defineConfig({
  resolve: {
    // Compile directement les sources TypeScript de @evolve/shared.
    conditions: ["@evolve/source", ...defaultClientConditions],
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 2000,
    rolldownOptions: {
      output: {
        // Phaser est volumineux et change rarement : un chunk séparé se met mieux en cache.
        manualChunks: (id) => (id.includes("node_modules/phaser") ? "phaser" : undefined),
      },
    },
  },
});
