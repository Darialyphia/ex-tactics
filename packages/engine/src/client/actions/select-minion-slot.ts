import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { MinionSlotClickRule, UiMinionslot } from '../controllers/ui-controller';

export class SelectMinionslotAction implements MinionSlotClickRule {
  constructor(private client: GameClient) {}

  predicate(slot: UiMinionslot, state: GameClientState) {
    return (
      state.interaction.state === INTERACTION_STATES.SELECTING_MINION_SLOT &&
      state.interaction.ctx.elligiblePosition.some(
        position =>
          position.playerId === slot.player.id &&
          position.zone === slot.zone &&
          position.slot === slot.slot
      ) &&
      this.client.ui.isInteractingPlayer
    );
  }

  handler(slot: UiMinionslot) {
    this.client.networkAdapter.dispatch({
      type: 'selectMinionSlot',
      payload: {
        playerId: this.client.playerId,
        slot: {
          zone: slot.zone,
          slot: slot.slot,
          player: slot.player.id
        }
      }
    });
  }
}
