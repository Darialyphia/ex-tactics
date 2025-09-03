import { isDefined } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import { isMinion, isSpell } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type {
  HeroAfterDealCombatDamageEvent,
  HeroBeforeDealCombatDamageEvent,
  HeroCard
} from '../../card/entities/hero.entity';
import type {
  MinionCard,
  MinionCardDealCombatDamageEvent
} from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { Modifier } from '../modifier.entity';
import type { ModifierMixin } from '../modifier-mixin';

export class CleaveModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  private otherTargets: MinionCard[] = [];

  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins: ModifierMixin<T>[] } = { mixins: [] }
  ) {
    super(KEYWORDS.CLEAVE.id, game, source, {
      name: KEYWORDS.CLEAVE.name,
      description: KEYWORDS.CLEAVE.description,
      icon: 'keyword-cleave',
      isUnique: true,
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_BEFORE_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            this.getOtherTargets(event);
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            this.getOtherTargets(event);
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            await this.dealCleaveDamage(event);
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            await this.dealCleaveDamage(event);
          }
        }),
        ...options.mixins
      ]
    });
  }

  private getOtherTargets(
    event:
      | MinionCardDealCombatDamageEvent
      | HeroBeforeDealCombatDamageEvent
      | HeroAfterDealCombatDamageEvent
  ) {
    if (!event.data.card.equals(this.target)) return;
    if (!isMinion(event.data.target)) return;
    this.otherTargets = [
      event.data.target.slot?.left?.minion,
      event.data.target.slot?.right?.minion
    ].filter(isDefined);
  }

  private async dealCleaveDamage(
    event:
      | MinionCardDealCombatDamageEvent
      | HeroBeforeDealCombatDamageEvent
      | HeroAfterDealCombatDamageEvent
  ) {
    if (!event.data.card.equals(this.target)) return;
    if (!isMinion(event.data.target)) return;
    for (const target of this.otherTargets) {
      await target.takeDamage(this.target, event.data.damage);
    }
    this.otherTargets = [];
  }
}
