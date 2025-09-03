import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { CardClickRule } from '../controllers/ui-controller';
import type { CardViewModel } from '../view-models/card.model';

export class SelectCardOnBoardAction implements CardClickRule {
  constructor(private client: GameClient) {}

  predicate(card: CardViewModel, state: GameClientState) {
    return (
      state.interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
      state.interaction.ctx.elligibleCards.includes(card.id) &&
      this.client.ui.isInteractingPlayer
    );
  }

  handler(card: CardViewModel) {
    this.client.networkAdapter.dispatch({
      type: 'selectCardOnBoard',
      payload: {
        cardId: card.id,
        playerId: this.client.playerId
      }
    });
  }
}
