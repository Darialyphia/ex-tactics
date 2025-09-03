import type { AnyCard } from '../../card/entities/card.entity';
import { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { PlayerTurnEvent } from '../../player/player.events';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class UntilStartOfNextOwnTurnModifierMixin<
  T extends AnyCard
> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;

  constructor(game: Game) {
    super(game);
    this.onTurnStart = this.onTurnStart.bind(this);
  }

  async onTurnStart(event: PlayerTurnEvent) {
    if (event.data.player.equals(this.modifier.source.player)) {
      await this.modifier.target.modifiers.remove(this.modifier.id);
    }
  }

  onApplied(target: AnyCard, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.game.once(GAME_EVENTS.PLAYER_START_TURN, this.onTurnStart);
  }

  onRemoved(): void {
    this.game.off(GAME_EVENTS.PLAYER_START_TURN, this.onTurnStart);
  }

  onReapplied(): void {}
}
