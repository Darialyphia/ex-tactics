import type { Game } from '../game/game';
import { Player, type PlayerOptions } from './player.entity';

export type PlayerManagerOptions = {
  players: Array<PlayerOptions>;
};

export class PlayerManager {
  private playerMap = new Map<string, Player>();

  constructor(private game: Game) {}

  initialize(options: PlayerManagerOptions) {
    options.players.forEach(p => {
      const player = new Player(this.game, p);
      this.playerMap.set(player.id, player);
    });
  }

  getPlayerById(id: string) {
    return this.playerMap.get(id);
  }

  get players() {
    return [...this.playerMap.values()];
  }
}
