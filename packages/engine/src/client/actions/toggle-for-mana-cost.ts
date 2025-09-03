import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { CardClickRule } from '../controllers/ui-controller';
import type { AbilityViewModel } from '../view-models/ability.model';
import type { CardViewModel } from '../view-models/card.model';

export class ToggleForManaCost implements CardClickRule {
  constructor(private client: GameClient) {}

  isValidInteractionState(state: GameClientState): boolean {
    return (
      state.interaction.state === INTERACTION_STATES.PLAYING_CARD ||
      state.interaction.state === INTERACTION_STATES.USING_ABILITY
    );
  }

  predicate(card: CardViewModel, state: GameClientState) {
    return (
      card.location === 'hand' &&
      this.isValidInteractionState(state) &&
      this.client.playerId === state.interaction.ctx.player &&
      card.canBeUsedAsManaCost
    );
  }

  async handler(card: CardViewModel) {
    const interaction = this.client.state.interaction;
    if (
      interaction.state !== INTERACTION_STATES.PLAYING_CARD &&
      interaction.state !== INTERACTION_STATES.USING_ABILITY
    ) {
      return;
    }

    const index = card.player.hand.findIndex(c => c.equals(card));
    if (this.client.ui.selectedManaCostIndices.includes(index)) {
      this.client.ui.selectedManaCostIndices =
        this.client.ui.selectedManaCostIndices.filter(i => i !== index);
      void this.client.fxAdapter.onUnselectCardForManaCost(card, this.client);
    } else {
      this.client.ui.selectedManaCostIndices.push(index);
      await this.client.fxAdapter.onSelectCardForManaCost(card, this.client);
      if (interaction.state === INTERACTION_STATES.PLAYING_CARD) {
        const playedCardId = interaction.ctx.card;
        const playedCard = this.client.state.entities[playedCardId] as CardViewModel;

        if (this.client.ui.selectedManaCostIndices.length === playedCard.manaCost) {
          this.client.commitPlayCard();
        }
      } else if (interaction.state === INTERACTION_STATES.USING_ABILITY) {
        const usedAbility = this.client.state.entities[
          interaction.ctx.ability
        ] as AbilityViewModel;

        if (this.client.ui.selectedManaCostIndices.length === usedAbility.manaCost) {
          this.client.commitUseAbility();
        }
      }
    }
  }
}
