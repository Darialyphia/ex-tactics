import type { Nullable } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import { isMinion } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { SpellDamage } from '../../utils/damage';

export class PusherModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    { mixins }: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(KEYWORDS.PUSHER.id, game, source, {
      name: KEYWORDS.PUSHER.name,
      description: KEYWORDS.PUSHER.description,
      icon: 'keyword-pusher',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PUSHER),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;
            if (!isMinion(event.data.target)) return;
            const behind = event.data.target.slot?.behind;
            if (!behind) return;
            if (behind.minion) {
              await behind.minion.takeDamage(this.target, new SpellDamage(2));
              await event.data.target.takeDamage(this.target, new SpellDamage(2));
            } else {
              const enemy = event.data.target;
              await enemy.player.boardSide.moveMinion(enemy.position!, {
                zone: 'defense',
                slot: enemy.position!.slot
              });
            }
          }
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
