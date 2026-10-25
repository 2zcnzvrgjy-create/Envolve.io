import { defaultClientConditions, defineConfig, type ProxyOptions } from "vite";

/** Chemin public sous lequel le serveur de jeu est relayé (voir src/config.ts). */
const GAME_SERVER_PATH = "/colyseus";
const GAME_SERVER_TARGET = process.env["GAME_SERVER_TARGET"] ?? "http://localhost:2567";

// Relaie HTTP (matchmaking) et WebSocket (salles) vers le serveur de jeu :
// le navigateur n'a besoin que d'une seule adresse, celle de la page.
const proxy: Record<string, ProxyOptions> = {
  [GAME_SERVER_PATH]: {
    target: GAME_SERVER_TARGET,
    ws: true,
    rewrite: (path) => path.slice(GAME_SERVER_PATH.length) || "/",
  },
};

// GitHub Codespaces sert la page en HTTPS sur le port 443 d'un domaine *.app.github.dev.
const inCodespaces = process.env["CODESPACES"] === "true";

export default defineConfig({
  resolve: {
    // Compile directement les sources TypeScript de @evolve/shared.
    conditions: ["@evolve/source", ...defaultClientConditions],
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    allowedHosts: [".app.github.dev"],
    proxy,
    ...(inCodespaces ? { hmr: { clientPort: 443 } } : {}),
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: [".app.github.dev"],
    proxy,
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
