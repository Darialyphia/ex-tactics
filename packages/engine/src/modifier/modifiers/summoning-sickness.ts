import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UntilEndOfTurnModifierMixin } from '../mixins/until-end-of-turn.mixin';
import { Modifier } from '../modifier.entity';

export class SummoningSicknessModifier extends Modifier<MinionCard> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.SUMMONING_SICKNESS.id, game, source, {
      isUnique: true,
      name: KEYWORDS.SUMMONING_SICKNESS.name,
      description: KEYWORDS.SUMMONING_SICKNESS.description,
      icon: 'keyword-summoning-sickness',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.SUMMONING_SICKNESS),
        new MinionInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: () => false
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'canUseAbility',
          interceptor: () => false
        }),
        new UntilEndOfTurnModifierMixin(game)
      ]
    });
  }
}
