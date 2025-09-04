import type { Game } from '../game/game';
import { Player, type PlayerOptions } from './player.entity';

export type PlayerSystemOptions = {
  players: Array<PlayerOptions>;
};

export class PlayerManager {
  private playerMap = new Map<string, Player>();

  constructor(private game: Game) {}

  initialize(options: PlayerSystemOptions) {
    options.players.forEach(p => {
      const player = new Player(this.game, p);
      this.playerMap.set(p.id, player);
    });
  }

  shutdown() {}

  getPlayerById(id: string) {
    return this.playerMap.get(id);
  }

  get players() {
    return [...this.playerMap.values()];
  }

  get player1() {
    return this.players[0];
  }

  get player2() {
    return this.players[1];
  }
}
