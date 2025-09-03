import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { InterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class EchoedDestinyModifier<T extends AnyCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.ECHOED_DESTINY.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RUSH),
        new InterceptorModifierMixin(game, {
          key: 'canBeUsedAsDestinyCost',
          interceptor(value, ctx, modifier) {
            return modifier.target.location === 'discardPile';
          }
        })
      ]
    });
  }
}
