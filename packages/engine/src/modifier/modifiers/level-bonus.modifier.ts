import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { Modifier } from '../modifier.entity';

export class LevelBonusModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private level: number
  ) {
    super(`${KEYWORDS.LEVEL_BONUS.id}_${level}`, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.LEVEL_BONUS),
        new TogglableModifierMixin(game, () => this.isActive)
      ]
    });
  }

  get isActive() {
    if (!this.target.player.hero) return false;
    return this.target.player.hero.level >= this.level;
  }
}
