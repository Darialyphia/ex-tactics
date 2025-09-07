import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { PLAYER_EVENTS } from './player.constants';
import type { Player } from './player.entity';

export class PlayerDeployedForTurnEvent extends TypedSerializableEvent<
  { player: Player },
  { playerId: string }
> {
  serialize(): { playerId: string } {
    return {
      playerId: this.data.player.id
    };
  }
}

export type PlayerEventMap = {
  [PLAYER_EVENTS.PLAYER_DEPLOYED_FOR_TURN]: PlayerDeployedForTurnEvent;
};
