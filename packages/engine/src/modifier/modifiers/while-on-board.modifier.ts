import type { MaybePromise } from '@game/shared';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { Modifier } from '../modifier.entity';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';

export class WhileOnBoardModifier<
  T extends MinionCard | ArtifactCard
> extends Modifier<T> {
  private isActivated = false;

  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    private options: {
      onActivate: (modifier: Modifier<T>) => MaybePromise<void>;
      onDeactivate: (modifier: Modifier<T>) => MaybePromise<void>;
    }
  ) {
    super(modifierType, game, source, {
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: '*',
          handler: async () => {
            if (this.target.location !== 'board') {
              if (!this.isActivated) return;
              this.isActivated = false;
              await this.deactivate();
            } else {
              if (this.isActivated) return;
              this.isActivated = true;
              await this.activate();
            }
          }
        })
      ]
    });
  }

  private activate() {
    return this.options.onActivate(this);
  }

  private deactivate() {
    return this.options.onDeactivate(this);
  }
}
