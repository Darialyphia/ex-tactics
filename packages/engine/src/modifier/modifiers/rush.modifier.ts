import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { SummoningSicknessModifier } from './summoning-sickness';

export class RushModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.RUSH.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RUSH),
        new MinionInterceptorModifierMixin(game, {
          key: 'hasSummoningSickness',
          interceptor: () => false
        }),
        ...(options.mixins || [])
      ]
    });
  }

  async applyTo(target: MinionCard): Promise<void> {
    await target.modifiers.remove(SummoningSicknessModifier);

    return super.applyTo(target);
  }
}
