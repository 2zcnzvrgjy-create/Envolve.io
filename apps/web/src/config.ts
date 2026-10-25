/** Port par défaut du serveur de jeu en développement. */
const DEFAULT_SERVER_PORT = 2567;

/**
 * Adresse du serveur de jeu. `VITE_SERVER_URL` permet de la fixer au build ;
 * sinon on vise le même hôte que la page (pratique pour tester en réseau local).
 */
export function resolveServerUrl(): string {
  const configured = import.meta.env["VITE_SERVER_URL"];
  if (typeof configured === "string" && configured.length > 0) return configured;

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.hostname}:${DEFAULT_SERVER_PORT}`;
}
