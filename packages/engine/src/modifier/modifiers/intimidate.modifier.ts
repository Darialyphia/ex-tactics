import { KEYWORDS } from '../../card/card-keywords';
import { isHero } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class IntimidateModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { minLevel: number; mixins?: ModifierMixin<T>[] }
  ) {
    super(KEYWORDS.INTIMIDATE.id, game, source, {
      name: KEYWORDS.INTIMIDATE.name,
      description: KEYWORDS.INTIMIDATE.description,
      icon: 'keyword-fearsome',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.INTIMIDATE),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCounterattacked',
          interceptor: (value, ctx) => {
            if (!value) return false;
            if (isHero(ctx.defender)) return value;
            return ctx.defender.manaCost > options.minLevel;
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
