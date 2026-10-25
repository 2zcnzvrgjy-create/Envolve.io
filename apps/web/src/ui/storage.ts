const NAME_KEY = "evolve.playerName";

// Le stockage local peut être indisponible (navigation privée, iframe…) : jamais bloquant.
export function loadPlayerName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // Ignoré volontairement.
  }
}
