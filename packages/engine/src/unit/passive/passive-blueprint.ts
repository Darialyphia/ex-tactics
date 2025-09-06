import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';

export type PassiveBlueprint = {
  id: string;
  description: string;
  iconId: string;
  detailledDescription: (game: Game, unit: Unit) => string;
  onApplied(game: Game, unit: Unit): void;
  onRemoved(game: Game, unit: Unit): void;
};
