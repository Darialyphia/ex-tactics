import type { EmptyObject, Serializable } from '@game/shared';
import { Entity } from '../entity';
import type { Game } from '../game/game';

export type SerializedPlayer = {
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
      id: this.id
    };
  }

  get opponent() {
    return this.game.playerManager.players.find(p => !p.equals(this))!;
  }
}
