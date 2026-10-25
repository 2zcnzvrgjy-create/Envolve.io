/**
 * Contrat réseau entre le client et le serveur.
 * Tout ce que le client envoie est considéré comme non fiable et revalidé côté serveur.
 */

/** Noms des salles enregistrées dans le matchmaking Colyseus. */
export const ROOM_NAMES = {
  solo: "solo",
} as const;

export type RoomName = (typeof ROOM_NAMES)[keyof typeof ROOM_NAMES];

/** Options envoyées par le client à la connexion (non fiables). */
export interface JoinOptions {
  name?: string;
}

/** Types des messages envoyés par le client. */
export const CLIENT_MESSAGES = {
  /** Direction de déplacement souhaitée. */
  input: "input",
} as const;

/**
 * Direction souhaitée, de norme ≤ 1 (0 = immobile, 1 = vitesse maximale).
 * Le serveur renormalise toute valeur hors limites.
 */
export interface InputMessage {
  x: number;
  y: number;
}
