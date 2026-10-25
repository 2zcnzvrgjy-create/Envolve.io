/**
 * Valeurs de jeu partagées. Centralisées ici pour pouvoir être ajustées
 * sans fouiller le code, et lues à l'identique par le client et le serveur.
 */
export const GAME_CONFIG = {
  /** Dimensions logiques de l'arène, en unités monde. */
  arena: {
    width: 4000,
    height: 4000,
  },
  /** Nombre maximal de joueurs par salle SOLO. Non mesuré : valeur de départ prudente. */
  maxPlayersPerRoom: 40,
} as const;

/**
 * Limites réseau appliquées côté serveur pour réduire les abus.
 */
export const NETWORK_CONFIG = {
  /** Fréquence de simulation du serveur (ticks par seconde). */
  serverTickRate: 20,
  /** Intervalle d'envoi des patchs d'état aux clients, en millisecondes. */
  patchIntervalMs: 50,
  /** Au-delà, le serveur déconnecte le client (géré par Colyseus). */
  maxMessagesPerSecond: 60,
} as const;

export const PLAYER_NAME_RULES = {
  minLength: 1,
  maxLength: 16,
  fallback: "Cellule",
} as const;
