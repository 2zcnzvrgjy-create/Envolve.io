/** Chemin sous lequel le serveur de développement relaie le serveur de jeu (voir vite.config.ts). */
const PROXIED_SERVER_PATH = "/colyseus";

/**
 * Adresse du serveur de jeu. `VITE_SERVER_URL` permet de la fixer au build ;
 * sinon on passe par la même adresse que la page, relayée vers le serveur.
 * Une seule adresse à exposer : pratique en réseau local, sur Codespaces ou derrière un proxy.
 */
export function resolveServerUrl(): string {
  const configured = import.meta.env["VITE_SERVER_URL"];
  if (typeof configured === "string" && configured.length > 0) return configured;

  return `${window.location.origin}${PROXIED_SERVER_PATH}`;
}
