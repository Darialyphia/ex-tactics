import type { MaybePromise } from '@game/shared';
import type { Game } from '../../game/game';
import type { GameEventMap } from '../../game/game.events';
import type { EventMapWithStarEvent } from '../../utils/async-emitter';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class GameEventModifierMixin<
  TEvent extends keyof EventMapWithStarEvent<GameEventMap>
> extends ModifierMixin<ModifierTarget> {
  constructor(
    game: Game,
    private options: {
      eventName: TEvent;
      handler: (
        event: EventMapWithStarEvent<GameEventMap>[TEvent],
        modifier: Modifier<ModifierTarget>
      ) => MaybePromise<void>;
      once?: boolean;
    }
  ) {
    super(game);
    this.handler = this.handler.bind(this);
  }

  private modifier!: Modifier<ModifierTarget>;

  private async handler(
    event: EventMapWithStarEvent<GameEventMap>[TEvent]
  ): Promise<void> {
    await this.options.handler(event, this.modifier);
  }

  onApplied(target: ModifierTarget, modifier: Modifier<ModifierTarget>): void {
    this.modifier = modifier;
    if (this.options.once) {
      this.game.once(this.options.eventName, this.handler);
    } else {
      this.game.on(this.options.eventName, this.handler);
    }
  }

  onRemoved(): void {
    this.game.off(this.options.eventName, this.handler);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReapplied(): void {}
}
