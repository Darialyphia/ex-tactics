import type { EmptyObject, Serializable } from '@game/shared';
import { Entity } from '../entity';
import type { Game } from '../game/game';

export type SerializedPlayer = {
  type: 'player';
  id: string;
};

export type PlayerOptions = { id: string };

export class Player
  extends Entity<EmptyObject>
  implements Serializable<SerializedPlayer>
{
  constructor(
    private game: Game,
    private options: PlayerOptions
  ) {
    super(`player-${options.id}`, {});
  }

  serialize() {
    return {
      type: 'player' as const,
      id: this.id
    };
  }

  get units() {
    return this.game.unitManager.units.filter(u => u.player.equals(this));
  }

  get opponent() {
    return this.game.playerManager.players.find(p => !p.equals(this))!;
  }
}
