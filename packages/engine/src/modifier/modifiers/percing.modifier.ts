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

export class PiercingModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  private behind: Nullable<MinionCard>;

  constructor(
    game: Game,
    source: AnyCard,
    { mixins }: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(KEYWORDS.PIERCING.id, game, source, {
      name: KEYWORDS.PIERCING.name,
      description: KEYWORDS.PIERCING.description,
      icon: 'keyword-piercing',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PIERCING),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_BEFORE_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;
            if (!isMinion(event.data.target)) return;
            this.behind = event.data.target.slot?.behind?.minion;
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;
            if (!isMinion(event.data.target)) return;
            this.behind = event.data.target.slot?.behind?.minion;
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;
            if (!isMinion(event.data.target)) return;
            await this.behind?.takeDamage(this.target, event.data.damage);
            this.behind = null;
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;
            if (!isMinion(event.data.target)) return;
            await this.behind?.takeDamage(this.target, event.data.damage);
            this.behind = null;
          }
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
