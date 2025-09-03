import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class DrifterModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    {
      mixins
    }: {
      mixins?: ModifierMixin<MinionCard>[];
    }
  ) {
    super(KEYWORDS.DRIFTER.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.DRIFTER),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.PLAYER_START_TURN,
          handler: async event => {
            if (!event.data.player.equals(this.target.player)) return;
            if (this.target.location !== 'board') return;
            const targetSlot =
              this.target.position!.zone === 'attack'
                ? this.target.slot!.behind!
                : this.target.slot!.inFront!;

            if (!targetSlot.isOccupied) {
              await this.target.moveTo(targetSlot, false);
            }
          }
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
