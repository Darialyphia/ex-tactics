import type { Game } from '../game/game';
import type { Obstacle } from './obstacle.entity';

export type ObstacleBlueprintBase = {
  id: string;
  name: string;
  description: string;
  spriteId: string;
  isAttackable: boolean;
  isWalkable: boolean;
  onInit: (game: Game, obstacle: Obstacle) => void;
};

export type DestroyableBlueprint =
  | { isDestroyable: false; maxHp?: never }
  | { isDestroyable: true; maxHp: number };

export type ObstacleBlueprint = ObstacleBlueprintBase & DestroyableBlueprint;
