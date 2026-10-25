import { PLAYER_NAME_RULES } from "./config.js";
import type { JoinOptions } from "./protocol.js";

// Caractères de contrôle et caractères invisibles de mise en forme (bidi, zero-width…).
const CONTROL_OR_FORMAT_CHARS = /[\p{Cc}\p{Cf}]/gu;
const WHITESPACE_RUNS = /\s+/gu;

/**
 * Nettoie un pseudo fourni par un client. Ne lève jamais d'erreur :
 * une entrée invalide retombe sur un nom par défaut.
 */
export function sanitizePlayerName(raw: unknown): string {
  if (typeof raw !== "string") return PLAYER_NAME_RULES.fallback;

  const cleaned = raw
    .normalize("NFC")
    .replace(CONTROL_OR_FORMAT_CHARS, "")
    .replace(WHITESPACE_RUNS, " ")
    .trim();

  // Découpe par points de code pour ne pas casser un emoji en deux.
  const truncated = Array.from(cleaned).slice(0, PLAYER_NAME_RULES.maxLength).join("").trim();

  return truncated.length >= PLAYER_NAME_RULES.minLength ? truncated : PLAYER_NAME_RULES.fallback;
}

/** Ne garde que les champs connus des options de connexion, nettoyés. */
export function parseJoinOptions(raw: unknown): Required<JoinOptions> {
  const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    name: sanitizePlayerName(source["name"]),
  };
}
