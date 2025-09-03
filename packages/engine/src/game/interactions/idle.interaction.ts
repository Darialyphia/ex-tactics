import type { Game } from '../game';

export class IdleContext {
  constructor(private game: Game) {}

  get player() {
    return this.game.gamePhaseSystem.currentPlayer;
  }
  serialize() {
    return {
      player: this.player.id
    };
  }
}
