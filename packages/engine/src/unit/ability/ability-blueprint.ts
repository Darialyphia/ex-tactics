import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';

export type AbilityBlueprint = {
  id: string;
  description: string;
  detailledDescription: (game: Game, unit: Unit) => string;
  manaCost: number;
  cooldown: number;
  getAttackTargetingShape(game: Game, unitId: string): string;
  getAttackAOEShape(game: Game, unitId: string): string;
  canUse(game: Game, unit: Unit): boolean;
  onResolve(game: Game, unit: Unit): void;
};
