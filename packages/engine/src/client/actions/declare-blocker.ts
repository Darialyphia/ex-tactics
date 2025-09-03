import { GAME_PHASES } from '../../game/game.enums';
import { COMBAT_STEPS } from '../../game/phases/combat.phase';
import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class DeclareBlockerAction implements CardActionRule {
  readonly id = 'declare_blocker';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return (
      this.client.state.phase.state === GAME_PHASES.ATTACK &&
      this.client.state.phase.ctx.step === COMBAT_STEPS.DECLARE_BLOCKER &&
      this.client.state.phase.ctx.potentialBlockers.includes(card.id) &&
      !this.client.state.effectChain
    );
  }

  getLabel() {
    return `Block`;
  }

  handler(card: CardViewModel) {
    this.client.networkAdapter.dispatch({
      type: 'declareBlocker',
      payload: {
        blockerId: card.id,
        playerId: this.client.playerId
      }
    });
  }
}
