import { CloseCode, type Room } from "@colyseus/sdk";
import type { ArenaState } from "@evolve/shared";
import type { GameConnection } from "../net/GameConnection";
import { requireElement } from "./dom";
import { loadPlayerName, savePlayerName } from "./storage";

export interface MenuHooks {
  /** Appelé une fois la salle rejointe. */
  onEnterGame: (room: Room<ArenaState>) => void;
  /** Appelé au retour au menu (départ volontaire ou déconnexion). */
  onExitGame: () => void;
}

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

  constructor(
    private readonly connection: GameConnection,
    private readonly hooks: MenuHooks,
  ) {}

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
      const room = await this.connection.joinSolo(name, (code) => {
        this.showMenu();
        this.showError(
          code === CloseCode.SERVER_SHUTDOWN
            ? "Le serveur redémarre. Réessaie dans un instant."
            : "Connexion perdue avec le serveur.",
        );
      });
      const renderSession = (state: ArenaState) => this.renderSession(room.roomId, state.players?.size ?? 0);
      room.onStateChange(renderSession);

      this.menu.hidden = true;
      this.session.hidden = false;
      // Le formulaire ne doit pas garder le focus clavier, réservé au jeu.
      this.nameInput.blur();
      this.playButton.blur();
      this.hooks.onEnterGame(room);
    } catch (error) {
      console.error("[evolve] connexion impossible", error);
      this.showError("Impossible de rejoindre le serveur. Est-il démarré ?");
    } finally {
      this.setBusy(false);
    }
  }

  private async leave(): Promise<void> {
    this.leaveButton.blur();
    await this.connection.leave();
    this.showMenu();
  }

  private renderSession(roomId: string, playerCount: number): void {
    const players = playerCount > 1 ? `${playerCount} joueurs` : `${playerCount} joueur`;
    this.sessionText.textContent = `${players} · salle ${roomId}`;
  }

  private showMenu(): void {
    this.hooks.onExitGame();
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
