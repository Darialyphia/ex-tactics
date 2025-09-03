import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { TidesFavoredModifier } from '../modifiers/tide-modifier';
import { TogglableModifierMixin } from './togglable.mixin';

export class TideModifierMixin<T extends AnyCard> extends TogglableModifierMixin<T> {
  constructor(game: Game, allowedLevels: Array<1 | 2 | 3>) {
    super(game, () => {
      if (this.modifier.target.location !== 'board') return false;

      const stacks =
        this.modifier.target.player.hero.modifiers.get(TidesFavoredModifier)?.stacks ?? 0;

      return allowedLevels.includes(stacks as 1 | 2 | 3);
    });
  }
}
