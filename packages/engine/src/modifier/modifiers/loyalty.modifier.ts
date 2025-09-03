import type { MainDeckCard } from '../../board/board.system';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { MainDeckCardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class LoyaltyModifier<T extends MainDeckCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, amount: number) {
    super(KEYWORDS.LOYALTY.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.LOYALTY),
        new MainDeckCardInterceptorModifierMixin(game, {
          key: 'loyalty',
          interceptor(value) {
            return value + amount;
          }
        })
      ]
    });
  }
}
