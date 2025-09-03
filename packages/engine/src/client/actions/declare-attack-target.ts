import { GAME_PHASES } from '../../game/game.enums';
import { COMBAT_STEPS } from '../../game/phases/combat.phase';
import type { GameClient } from '../client';
import type { CardClickRule } from '../controllers/ui-controller';
import type { CardViewModel } from '../view-models/card.model';

export class DeclareAttackTargetCardAction implements CardClickRule {
  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return (
      this.client.state.phase.state === GAME_PHASES.ATTACK &&
      this.client.state.phase.ctx.step === COMBAT_STEPS.DECLARE_TARGET &&
      this.client.state.phase.ctx.potentialTargets.some(id => id === card.id) &&
      card.player.id !== this.client.playerId &&
      this.client.ui.isInteractingPlayer
    );
  }

  handler(card: CardViewModel) {
    this.client.networkAdapter.dispatch({
      type: 'declareAttackTarget',
      payload: {
        targetId: card.id,
        playerId: this.client.playerId
      }
    });
  }
}
