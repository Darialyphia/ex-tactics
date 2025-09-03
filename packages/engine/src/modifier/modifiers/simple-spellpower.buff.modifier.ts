import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { Game } from '../../game/game';
import { HeroInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimpleSpellpowerBuffModifier extends Modifier<HeroCard> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number;
      name?: string;
      mixins?: ModifierMixin<HeroCard>[];
    }
  ) {
    super(modifierType, game, card, {
      icon: options.amount > 0 ? 'keyword-spellpower-buff' : 'keyword-spellpower-debuff',
      name:
        (options.name ?? options.amount > 0) ? 'Spellpower Buff' : 'Spellpower Debuff',
      description: `${options.amount > 0 ? '+' : '-'}${options.amount} Spellpower`,
      mixins: [
        new HeroInterceptorModifierMixin(game, {
          key: 'spellPower',
          interceptor: value => {
            return value + options.amount * this._stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
