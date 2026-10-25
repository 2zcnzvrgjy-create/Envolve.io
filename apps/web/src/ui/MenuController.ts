import { CloseCode } from "@colyseus/sdk";
import type { GameConnection, SessionInfo } from "../net/GameConnection";
import { requireElement } from "./dom";
import { loadPlayerName, savePlayerName } from "./storage";

/** Relie le menu HTML et le badge de session à la connexion réseau. */
export class MenuController {
  private readonly menu = requireElement("menu", HTMLElement);
  private readonly form = requireElement("play-form", HTMLFormElement);
  private readonly nameInput = requireElement("player-name", HTMLInputElement);
  private readonly playButton = requireElement("play-button", HTMLButtonElement);
  private readonly errorText = requireElement("menu-error", HTMLParagraphElement);
  private readonly session = requireElement("session", HTMLElement);
  private readonly sessionText = requireElement("session-text", HTMLSpanElement);
  private readonly leaveButton = requireElement("leave-button", HTMLButtonElement);

  constructor(private readonly connection: GameConnection) {}

  mount(): void {
    this.nameInput.value = loadPlayerName();
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.play();
    });
    this.leaveButton.addEventListener("click", () => void this.leave());
    this.nameInput.focus();
  }

  private async play(): Promise<void> {
    if (this.connection.isConnected) return;

    const name = this.nameInput.value.trim();
    savePlayerName(name);
    this.setBusy(true);
    this.showError(null);

    try {
      await this.connection.joinSolo(name, {
        onSessionChanged: (info) => this.renderSession(info),
        onDisconnected: (code) => {
          this.showMenu();
          this.showError(
            code === CloseCode.SERVER_SHUTDOWN
              ? "Le serveur redémarre. Réessaie dans un instant."
              : "Connexion perdue avec le serveur.",
          );
        },
      });
      this.menu.hidden = true;
      this.session.hidden = false;
    } catch (error) {
      console.error("[evolve] connexion impossible", error);
      this.showError("Impossible de rejoindre le serveur. Est-il démarré ?");
    } finally {
      this.setBusy(false);
    }
  }

  private async leave(): Promise<void> {
    await this.connection.leave();
    this.showMenu();
  }

  private renderSession({ roomId, playerCount }: SessionInfo): void {
    const players = playerCount > 1 ? `${playerCount} joueurs` : `${playerCount} joueur`;
    this.sessionText.textContent = `${players} · salle ${roomId}`;
  }

  private showMenu(): void {
    this.session.hidden = true;
    this.menu.hidden = false;
    this.nameInput.focus();
  }

  private setBusy(busy: boolean): void {
    this.playButton.disabled = busy;
    this.playButton.textContent = busy ? "CONNEXION…" : "JOUER";
  }

  private showError(message: string | null): void {
    this.errorText.hidden = message === null;
    this.errorText.textContent = message ?? "";
  }
}
