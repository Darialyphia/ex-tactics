import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class PlayCardAction implements CardActionRule {
  readonly id = 'play';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return card.canPlay && card.location === 'hand';
  }

  getLabel(card: CardViewModel) {
    return `@[mana] ${card.manaCost}@ Play`;
  }

  handler(card: CardViewModel) {
    this.client.ui.optimisticState.playedCardId = card.id;

    this.client.networkAdapter.dispatch({
      type: 'declarePlayCard',
      payload: {
        index: card.player.hand.findIndex(c => c.equals(card)),
        playerId: this.client.playerId
      }
    });

    void this.client.fxAdapter.onDeclarePlayCard(card, this.client);
  }
}
