import type { Game } from '../game/game';
import type { ModifierTarget, Modifier } from './modifier.entity';

export abstract class ModifierMixin<T extends ModifierTarget> {
  protected game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  abstract onApplied(target: T, modifier: Modifier<T>): void;
  abstract onRemoved(target: T, modifier: Modifier<T>): void;
  abstract onReapplied(
    target: T,
    modifier: Modifier<T>,
    stacks?: number,
    oldStacks?: number
  ): void;
}
