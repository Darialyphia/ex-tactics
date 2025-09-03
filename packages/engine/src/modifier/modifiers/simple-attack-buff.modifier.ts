import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimpleAttackBuffModifier<
  T extends MinionCard | HeroCard
> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number;
      name?: string;
      mixins?: ModifierMixin<T>[];
    }
  ) {
    super(modifierType, game, card, {
      isUnique: true,
      icon: options.amount > 0 ? 'keyword-attack-buff' : 'keyword-attack-debuff',
      name: (options.name ?? options.amount > 0) ? 'Attack Buff' : 'Attack Debuff',
      description: `${options.amount > 0 ? '+' : '-'}${options.amount} Attack`,
      mixins: [
        new RemoveOnDestroyedMixin(game),
        new UnitInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: value => {
            return value + options.amount * this._stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
