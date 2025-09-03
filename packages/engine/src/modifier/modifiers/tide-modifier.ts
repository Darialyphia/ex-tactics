import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class FixTideModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    readonly amount: number
  ) {
    super('fix-tide', game, source, {
      mixins: [new TogglableModifierMixin(game, () => this.target.location === 'board')],
      isUnique: true
    });
  }
}

export class TidesFavoredModifier extends Modifier<HeroCard> {
  constructor(game: Game, source: AnyCard) {
    super('tides-favored', game, source, {
      isUnique: true,
      name: "Tide's Favored",
      description: KEYWORDS.TIDE.description,
      icon: 'keyword-tides-favored',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.PLAYER_START_TURN,
          handler: async event => {
            if (game.gamePhaseSystem.elapsedTurns === 0) return;
            if (this.fixedAmount) {
              if (this.stacks !== this.fixedAmount) {
                await this.setStacks(this.fixedAmount);
                return;
              }
            }
            if (event.data.player.equals(source.player)) {
              await this.raiseTides();
            }
          }
        })
      ]
    });
  }

  get fixedAmount() {
    for (const card of this.target.player.boardSide.getAllCardsInPlay()) {
      if (card.modifiers.has(FixTideModifier)) {
        const modifier = card.modifiers.get(FixTideModifier)!;
        return modifier.amount;
      }
    }

    return null;
  }

  async raiseTides() {
    if (this.fixedAmount) return;

    const newStacks = this.stacks + 1 > 3 ? 1 : this.stacks + 1;
    await this.setStacks(newStacks);
  }

  async lowerTides() {
    if (this.fixedAmount) return;
    const newStacks = Math.max(this.stacks - 1, 1);
    await this.setStacks(newStacks);
  }
}

export class TideModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    {
      allowedLevels,
      mixins
    }: {
      allowedLevels: Array<1 | 2 | 3>;
      mixins?: ModifierMixin<MinionCard>[];
    }
  ) {
    super(KEYWORDS.TIDE.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.TIDE),
        new TogglableModifierMixin(game, () => {
          if (source.location !== 'board') return false;

          const stacks =
            source.player.hero.modifiers.get(TidesFavoredModifier)?.stacks ?? 0;

          return allowedLevels.includes(stacks as 1 | 2 | 3);
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
