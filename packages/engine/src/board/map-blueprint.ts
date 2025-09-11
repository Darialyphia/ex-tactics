import type { Point3D, Values } from '@game/shared';
import type { Game } from '../game/game';
import type { Direction } from './board.utils';

export type MapBlueprint = {
  id: string;
  rows: number;
  cols: number;
  cells: Array<{
    tile: string;
    obstacle?: {
      blueprintId: string;
      orientation: Direction;
    };
  } | null>;
  onInit(game: Game): void;
  players: Array<{
    obstacles: Array<{
      position: Point3D;
      blueprintId: string;
      orientation: Direction;
    }>;
  }>;
};

export const TERRAINS = {
  GROUND: 'ground',
  WALL: 'wall',
  EMPTY: 'empty'
} as const;

export type Terrain = Values<typeof TERRAINS>;
