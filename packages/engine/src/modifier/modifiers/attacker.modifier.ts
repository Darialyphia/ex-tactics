import type { MaybePromise } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GAME_EVENTS } from '../../game/game.events';

export class AttackerModifier extends Modifier<MinionCard> {
  constructor(game: Game, source: AnyCard, handler: () => MaybePromise<void>) {
    super(KEYWORDS.ATTACKER.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ATTACKER),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_SUMMONED,
          handler: async event => {
            if (
              event.data.card.equals(this.target) &&
              this.target.position?.zone === 'attack'
            ) {
              await handler();
            }
          }
        })
      ]
    });
  }
}
