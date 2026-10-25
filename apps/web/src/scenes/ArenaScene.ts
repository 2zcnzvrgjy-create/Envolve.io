import Phaser from "phaser";
import { Callbacks, type Room } from "@colyseus/sdk";
import {
  CLIENT_MESSAGES,
  ENERGY_CONFIG,
  GAME_CONFIG,
  NETWORK_CONFIG,
  type ArenaState,
  type EnergyState,
  type PlayerState,
} from "@evolve/shared";
import { CAMERA_CONFIG, smoothTowards, zoomForRadius } from "../game/camera";
import { InputController } from "../game/InputController";
import { ARENA_COLORS, energyColor } from "../game/palette";
import { PlayerView } from "../game/PlayerView";
import { ENERGY_CORE_RATIO, ensureTextures, TEXTURES } from "../game/textures";
import type { Hud } from "../ui/Hud";

/** Retard d'affichage des positions serveur : deux patchs, pour toujours interpoler. */
const INTERPOLATION_DELAY_MS = NETWORK_CONFIG.patchIntervalMs * 2;
/** Taille d'affichage telle que le cœur de la particule ait le rayon défini dans la config. */
const ENERGY_DISPLAY_SIZE = (ENERGY_CONFIG.radius * 2) / ENERGY_CORE_RATIO;

export interface ArenaSceneData {
  room: Room<ArenaState>;
  hud: Hud;
}

/**
 * Affiche l'arène telle que décrite par le serveur. Le client n'a aucune
 * autorité : il envoie une direction et dessine l'état reçu.
 */
export class ArenaScene extends Phaser.Scene {
  static readonly KEY = "arena";

  private room!: Room<ArenaState>;
  private hud!: Hud;
  private input$!: InputController;
  private readonly players = new Map<string, PlayerView>();
  private readonly energy = new Map<string, Phaser.GameObjects.Image>();
  private readonly cleanups: Array<() => void> = [];
  private zoom = 1;

  constructor() {
    super(ArenaScene.KEY);
  }

  init(data: ArenaSceneData): void {
    this.room = data.room;
    this.hud = data.hud;
  }

  create(): void {
    ensureTextures(this);
    this.drawArena();

    const callbacks = Callbacks.get(this.room);
    this.cleanups.push(
      callbacks.onAdd("players", (player, id) => this.addPlayer(id, player)),
      callbacks.onRemove("players", (_player, id) => this.removePlayer(id)),
      callbacks.onAdd("energy", (energy, id) => this.addEnergy(id, energy)),
      callbacks.onRemove("energy", (_energy, id) => this.removeEnergy(id)),
    );

    const onStateChange = (state: ArenaState) => this.recordSnapshot(state);
    this.room.onStateChange(onStateChange);
    this.cleanups.push(() => this.room.onStateChange.remove(onStateChange));

    this.input$ = new InputController(this, (input) => this.room.send(CLIENT_MESSAGES.input, input));

    this.cameras.main.setBackgroundColor(ARENA_COLORS.outside);
    this.hud.show();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.teardown());
  }

  override update(_time: number, deltaMs: number): void {
    const now = performance.now();
    const dt = deltaMs / 1000;
    const renderTime = now - INTERPOLATION_DELAY_MS;

    for (const view of this.players.values()) view.update(renderTime, dt);

    const local = this.players.get(this.room.sessionId);
    if (!local) return;

    const camera = this.cameras.main;
    const targetZoom = zoomForRadius(local.radius, camera.width, camera.height);
    this.zoom = smoothTowards(this.zoom, targetZoom, CAMERA_CONFIG.zoomSmoothing, dt);
    camera.setZoom(this.zoom);
    camera.centerOn(local.x, local.y);

    // Caméra centrée sur le joueur : il est au milieu de l'écran.
    this.input$.update(now, { x: camera.width / 2, y: camera.height / 2 }, local.radius * this.zoom);
  }

  private drawArena(): void {
    const { width, height } = GAME_CONFIG.arena;
    this.add.tileSprite(0, 0, width, height, TEXTURES.arenaFloor).setOrigin(0, 0).setDepth(0);
    this.add
      .rectangle(0, 0, width, height)
      .setOrigin(0, 0)
      .setStrokeStyle(6, ARENA_COLORS.border, 0.6)
      .setDepth(2);
  }

  private addPlayer(id: string, state: PlayerState): void {
    if (this.players.has(id)) return;
    this.players.set(id, new PlayerView(this, state, id === this.room.sessionId));
    if (id === this.room.sessionId) {
      this.zoom = zoomForRadius(this.players.get(id)!.radius, this.cameras.main.width, this.cameras.main.height);
    }
  }

  private removePlayer(id: string): void {
    this.players.get(id)?.destroy();
    this.players.delete(id);
  }

  private addEnergy(id: string, state: EnergyState): void {
    if (this.energy.has(id)) return;
    const image = this.add
      .image(state.x, state.y, TEXTURES.energy)
      .setDisplaySize(ENERGY_DISPLAY_SIZE, ENERGY_DISPLAY_SIZE)
      .setTint(energyColor(id))
      .setDepth(5);
    this.energy.set(id, image);
  }

  private removeEnergy(id: string): void {
    const image = this.energy.get(id);
    if (!image) return;
    this.energy.delete(id);
    // Petit effet d'absorption, purement visuel.
    this.tweens.add({
      targets: image,
      scale: 0,
      alpha: 0,
      duration: 120,
      onComplete: () => image.destroy(),
    });
  }

  /** Mémorise les positions reçues pour l'interpolation. */
  private recordSnapshot(state: ArenaState): void {
    const now = performance.now();
    state.players.forEach((player, id) => {
      const view = this.players.get(id);
      if (!view) return;
      view.buffer.push(now, player.x, player.y);
      view.setMass(player.mass);
    });
    const local = state.players.get(this.room.sessionId);
    if (local) this.hud.setMass(local.mass);
  }

  private teardown(): void {
    for (const cleanup of this.cleanups.splice(0)) cleanup();
    for (const view of this.players.values()) view.destroy();
    this.players.clear();
    this.energy.clear(); // les images sont détruites avec la scène
    this.hud.hide();
  }
}
