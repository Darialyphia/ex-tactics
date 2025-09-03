import type { CardAfterDestroyEvent } from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS, type GameEventMap } from '../../game/game.events';
import type { EventMapWithStarEvent } from '../../utils/typed-emitter';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class RemoveOnDestroyedMixin extends ModifierMixin<AnyCard> {
  private modifier!: Modifier<AnyCard>;

  constructor(game: Game) {
    super(game);
    this.onCardDestroyed = this.onCardDestroyed.bind(this);
  }

  async onCardDestroyed(event: CardAfterDestroyEvent) {
    if (event.data.card.equals(this.modifier.target)) {
      this.game.off(GAME_EVENTS.CARD_AFTER_DESTROY, this.onCardDestroyed);
      await this.modifier.target.modifiers.remove(this.modifier);
    }
  }

  onApplied(target: AnyCard, modifier: Modifier<AnyCard>): void {
    this.modifier = modifier;

    this.game.on(GAME_EVENTS.CARD_AFTER_DESTROY, this.onCardDestroyed);
  }

  onRemoved(): void {
    this.game.off(GAME_EVENTS.CARD_AFTER_DESTROY, this.onCardDestroyed);
  }

  onReapplied(): void {}
}
