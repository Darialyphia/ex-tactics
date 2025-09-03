import type { Keyword } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';

export class KeywordModifierMixin<T extends AnyCard> extends ModifierMixin<T> {
  constructor(
    game: Game,
    private keyword: Keyword
  ) {
    super(game);
  }

  onApplied(target: T): void {
    target.keywordManager?.add(this.keyword);
  }

  onRemoved(target: T): void {
    target.keywordManager.remove(this.keyword);
  }

  onReapplied(): void {}
}
