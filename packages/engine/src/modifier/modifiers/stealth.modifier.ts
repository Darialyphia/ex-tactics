import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class StealthModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options: { mixins?: ModifierMixin<T>[] }) {
    super(KEYWORDS.STEALTH.id, game, source, {
      name: KEYWORDS.STEALTH.name,
      description: KEYWORDS.STEALTH.description,
      icon: 'keyword-stealth',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.STEALTH),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeAttacked',
          interceptor: value => {
            if (!value) return value;
            return this.target.isExhausted && this.target.location === 'board';
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
