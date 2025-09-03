import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { Modifier } from '../modifier.entity';

export class LineageBonusModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private heroId: string
  ) {
    super(`${KEYWORDS.LINEAGE_BONUS}_${heroId}`, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.LINEAGE_BONUS),
        new TogglableModifierMixin(game, () => this.isActive)
      ]
    });
  }

  get isActive() {
    return this.target.player.hero.blueprintId === this.heroId;
  }
}
