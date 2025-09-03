import type { MainDeckCard } from '../../board/board.system';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class PrideModifier extends Modifier<MinionCard> {
  constructor(game: Game, source: AnyCard, minLevel: number) {
    super(KEYWORDS.PRIDE.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PRIDE),
        new MinionInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: (value: boolean) => {
            if (this.target.player.hero.level < minLevel) {
              return false;
            }
            return value;
          }
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'canBlock',
          interceptor: (value: boolean) => {
            if (this.target.player.hero.level < minLevel) {
              return false;
            }
            return value;
          }
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'canUseAbility',
          interceptor: (value: boolean) => {
            if (this.target.player.hero.level < minLevel) {
              return false;
            }
            return value;
          }
        })
      ]
    });
  }
}
