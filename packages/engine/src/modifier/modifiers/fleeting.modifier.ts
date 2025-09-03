import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class PercingFleeting<T extends AnyCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.FLEETING.id, game, source, {
      name: KEYWORDS.FLEETING.name,
      description: KEYWORDS.FLEETING.description,
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.FLEETING),
        new GameEventModifierMixin(game, {
          once: true,
          eventName: GAME_EVENTS.PLAYER_END_TURN,
          handler: async () => {
            if (this.target.location === 'hand') {
              this.target.removeFromCurrentLocation();
            }
          }
        })
      ]
    });
  }
}
