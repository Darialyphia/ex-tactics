import type { Point, Values } from '@game/shared';

export type MapBlueprint = {
  id: string;
  rows: number;
  cols: number;
  cells: Array<{
    tile: string;
    obstacles: string[];
  }>;
};

export const TERRAINS = {
  GROUND: 'ground',
  WALL: 'wall',
  EMPTY: 'empty'
} as const;

export type Terrain = Values<typeof TERRAINS>;
