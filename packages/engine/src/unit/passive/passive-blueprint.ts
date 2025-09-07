import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';
import type { Passive } from './passive.entity';

export type PassiveBlueprint = {
  id: string;
  iconId: string;
  description: string;
  dynamicDescription: (game: Game, passive: Passive) => string;
  onApplied(game: Game, unit: Unit): void;
  onRemoved(game: Game, unit: Unit): void;
};
