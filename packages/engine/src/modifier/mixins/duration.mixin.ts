import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';

export class DurationModifierMixin<T extends AnyCard = AnyCard> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;

  private initialDuration: number;
  constructor(
    game: Game,
    private duration = 1
  ) {
    super(game);
    this.initialDuration = duration;
    this.onTurnEnd = this.onTurnEnd.bind(this);
  }

  async onTurnEnd() {
    this.duration--;
    if (this.duration === 0) {
      await this.modifier.target.modifiers.remove(this.modifier.modifierType);
    }
  }

  onApplied(target: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.game.on(GAME_EVENTS.PLAYER_END_TURN, this.onTurnEnd);
  }

  onRemoved() {
    this.game.off(GAME_EVENTS.PLAYER_END_TURN, this.onTurnEnd);
  }

  onReapplied(): void {
    this.duration = this.initialDuration;
  }
}
