import { isDefined } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimpleManaCostBuffModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number;
      mixins?: ModifierMixin<T>[];
    }
  ) {
    super(modifierType, game, card, {
      mixins: [
        new CardInterceptorModifierMixin(game, {
          key: 'manaCost',
          interceptor: value => {
            if (!isDefined(value)) return value;
            return value + options.amount * this._stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
