import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { CardClickRule } from '../controllers/ui-controller';
import type { CardViewModel } from '../view-models/card.model';

export class SelectCardAction implements CardClickRule {
  constructor(private client: GameClient) {}

  predicate(card: CardViewModel, state: GameClientState) {
    return (
      card.player.id === this.client.playerId &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      !this.client.ui.selectedCard?.equals(card)
    );
  }

  handler(card: CardViewModel) {
    this.client.ui.select(card);
  }
}
