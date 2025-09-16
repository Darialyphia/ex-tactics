import type { Game } from '../game/game';
import type { Unit } from '../unit/unit.entity';
import type { Obstacle } from './obstacle.entity';

export type ObstacleBlueprintBase = {
  id: string;
  name: string;
  description: string;
  sprite: {
    id: string;
    defaultParts: Record<string, string>;
  };
  isWalkable: boolean;
  onInit: (game: Game, obstacle: Obstacle) => void;
};

export type AttackableBlueprint =
  | { isAttackable: false; onAttacked?: never }
  | {
      isAttackable: true;
      onAttacked: (game: Game, obstacle: Obstacle, source: Unit) => void;
    };

export type DestroyableBlueprint =
  | { isDestroyable: false; maxHp?: never; onDestroyed?: never }
  | {
      isDestroyable: true;
      maxHp: number;
      onDestroyed?: (game: Game, obstacle: Obstacle, source: Unit) => void;
    };

export type ObstacleBlueprint = ObstacleBlueprintBase &
  DestroyableBlueprint &
  AttackableBlueprint;
