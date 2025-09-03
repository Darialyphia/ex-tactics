import { KEYWORDS } from '../../card/card-keywords';
import { isMinionOrHero } from '../../card/card-utils';
import { type AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import type { AttackTarget } from '../../game/phases/combat.phase';
import { AuraModifierMixin } from '../mixins/aura.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class TauntModifier<T extends AnyCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, { mixins }: { mixins?: ModifierMixin<T>[] }) {
    super(KEYWORDS.TAUNT.id, game, source, {
      name: KEYWORDS.TAUNT.name,
      description: KEYWORDS.TAUNT.description,
      icon: 'keyword-provoke',
      isUnique: true,
      mixins: [
        new TogglableModifierMixin(game, () => this.target.location === 'board'),
        new KeywordModifierMixin(game, KEYWORDS.FLEETING),
        new AuraModifierMixin(game, {
          canSelfApply: false,
          isElligible: candidate => {
            return (
              candidate.player.equals(this.target.player.opponent) &&
              candidate.location === 'board' &&
              isMinionOrHero(candidate)
            );
          },
          onGainAura: async candidate => {
            await (candidate as MinionCard).addInterceptor('canAttack', this.interceptor);
          },
          onLoseAura: async candidate => {
            await (candidate as MinionCard).removeInterceptor(
              'canAttack',
              this.interceptor
            );
          }
        }),
        ...(mixins ?? [])
      ]
    });
  }

  interceptor(value: boolean, { target }: { target: AttackTarget }): boolean {
    if (!value) return false;

    return target.modifiers.has(TauntModifier);
  }
}
