import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class ElusiveModifier<T extends MinionCard> extends Modifier<T> {
  private hasBeenAttacked = 0;

  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.ELUSIVE.id, game, source, {
      name: KEYWORDS.ELUSIVE.name,
      description: KEYWORDS.ELUSIVE.description,
      icon: 'keyword-elusive',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RUSH),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.BEFORE_RESOLVE_COMBAT,
          handler: async ({ data }) => {
            if (!data.target.equals(this.target)) return;
            if (this.hasBeenAttacked > 0) return;
            this.hasBeenAttacked++;

            const phaseCtx = this.game.gamePhaseSystem.getContext<'attack_phase'>();
            const left = this.target.slot!.left;
            const right = this.target.slot!.right;
            if (left && !left?.isOccupied) {
              await this.target.moveTo(left);
              await phaseCtx.ctx.cancelAttack();
            } else if (right && !right?.isOccupied) {
              await this.target.moveTo(right);
              await phaseCtx.ctx.cancelAttack();
            }
          }
        })
      ]
    });
  }
}
