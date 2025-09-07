import type { Point3D, Values } from '@game/shared';
import type { Game } from '../game/game';

export type MapBlueprint = {
  id: string;
  rows: number;
  cols: number;
  cells: Array<{
    tile: string;
    obstacles: string[];
  }>;
  onInit(game: Game): void;
  players: Array<{
    shrines: Point3D[];
  }>;
};

export const TERRAINS = {
  GROUND: 'ground',
  WALL: 'wall',
  EMPTY: 'empty'
} as const;

export type Terrain = Values<typeof TERRAINS>;
