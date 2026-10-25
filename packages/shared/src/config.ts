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

/** Règles de taille et de vitesse des joueurs (voir rules.ts pour les formules). */
export const PLAYER_CONFIG = {
  /** Masse à l'apparition. */
  startMass: 10,
  /** Masse plafond, pour borner la taille et la perte de vitesse. */
  maxMass: 2000,
  /** rayon = radiusPerSqrtMass × √masse (la surface croît avec la masse). */
  radiusPerSqrtMass: 6,
  /** Vitesse à la masse de départ, en unités par seconde. */
  baseSpeed: 320,
  /** Plus l'exposant est fort, plus les gros joueurs ralentissent. */
  speedMassExponent: 0.3,
  /** Vitesse plancher, quelle que soit la masse. */
  minSpeed: 110,
  /** Distance minimale aux bords de l'arène à l'apparition. */
  spawnMargin: 150,
} as const;

/** Particules d'énergie à collecter. */
export const ENERGY_CONFIG = {
  /** Nombre de particules maintenu en permanence dans l'arène. */
  count: 600,
  /** Masse gagnée par particule. */
  value: 1,
  /** Rayon d'affichage d'une particule (la collecte se fait au contact du centre). */
  radius: 6,
  /** Distance minimale aux bords à l'apparition. */
  spawnMargin: 20,
} as const;

/** Collisions entre joueurs (répulsion, sans élimination à l'étape 2). */
export const COLLISION_CONFIG = {
  /** Part du chevauchement corrigée à chaque tick (1 = séparation immédiate). */
  separationFactor: 0.5,
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
  /** Intervalle minimal entre deux envois d'entrée par le client. */
  inputSendIntervalMs: 50,
  /** Pas de temps maximal simulé en un tick (évite les sauts après un ralentissement). */
  maxStepSeconds: 0.1,
} as const;

export const PLAYER_NAME_RULES = {
  minLength: 1,
  maxLength: 16,
  fallback: "Cellule",
} as const;

/** Nombre de couleurs de joueurs disponibles (la palette est définie côté client). */
export const PLAYER_COLOR_COUNT = 8;
