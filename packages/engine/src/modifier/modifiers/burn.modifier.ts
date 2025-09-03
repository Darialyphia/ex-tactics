import { KEYWORDS } from '../../card/card-keywords';
import { isSpell } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { AbilityDamage, SpellDamage } from '../../utils/damage';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import { Modifier } from '../modifier.entity';

export class BurnModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.BURN.id, game, source, {
      name: KEYWORDS.BURN.name,
      description: KEYWORDS.BURN.description,
      icon: 'keyword-burn',
      isUnique: true,
      mixins: [
        new RemoveOnDestroyedMixin(game),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.PLAYER_START_TURN,
          handler: async () => {
            await this.target.takeDamage(
              source,
              isSpell(source) ? new SpellDamage(1) : new AbilityDamage(1)
            );
          }
        })
      ]
    });
  }
}
