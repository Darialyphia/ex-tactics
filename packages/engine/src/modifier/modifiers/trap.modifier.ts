import type { MaybePromise } from '@game/shared';
import type { Game } from '../..';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard, CardInterceptors } from '../../card/entities/card.entity';
import type { GameEventMap } from '../../game/game.events';
import type { EventMapWithStarEvent } from '../../utils/typed-emitter';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { Modifier, type ModifierTarget } from '../modifier.entity';
import {
  CardInterceptorModifierMixin,
  InterceptorModifierMixin,
  MainDeckCardInterceptorModifierMixin
} from '../mixins/interceptor.mixin';

export class TrapModifier<
  TTarget extends AnyCard,
  TEvent extends keyof EventMapWithStarEvent<GameEventMap>
> extends Modifier<TTarget> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      eventName: TEvent;
      predicate: (event: EventMapWithStarEvent<GameEventMap>[TEvent]) => boolean;
      handler: (
        event: EventMapWithStarEvent<GameEventMap>[TEvent],
        modifier: Modifier<ModifierTarget>
      ) => MaybePromise<void>;
    }
  ) {
    super(KEYWORDS.TRAP.id, game, source, {
      mixins: [
        new CardInterceptorModifierMixin(game, {
          key: 'canBeRecollected',
          interceptor: () => false
        }),
        new TogglableModifierMixin(game, () => this.target.location === 'destinyZone'),
        new GameEventModifierMixin(game, {
          eventName: options.eventName,
          handler: async (event, modifier) => {
            if (!options.predicate(event)) return;
            await options.handler(event, modifier);
          }
        })
      ]
    });
  }
}
