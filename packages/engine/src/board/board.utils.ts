import { assert, isDefined, type Point, type Point3D, type Values } from '@game/shared';
import type { SerializedCoords } from './board-cell.entity';

export const DIRECTION = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'east'
} as const;

export const DIRECTIONS_TO_DIFF = {
  [DIRECTION.NORTH]: { x: 0, y: -1 },
  [DIRECTION.SOUTH]: { x: 0, y: 1 },
  [DIRECTION.WEST]: { x: -1, y: 0 },
  [DIRECTION.EAST]: { x: 1, y: 0 }
} as const satisfies Record<Direction, Point>;

export const getDirectionFromDiff = (a: Point, b: Point) => {
  const diffX = b.x - a.x;
  const diffY = b.y - a.y;
  console.log(a, b);
  if (diffX === 0 && diffY === -1) {
    return DIRECTION.NORTH;
  }
  if (diffX === 0 && diffY === 1) {
    return DIRECTION.SOUTH;
  }
  if (diffX === -1 && diffY === 0) {
    return DIRECTION.WEST;
  }
  if (diffX === 1 && diffY === 0) {
    return DIRECTION.EAST;
  }

  return null;
};
export type Direction = Values<typeof DIRECTION>;

export const pointToCellId = (point: Point3D): SerializedCoords =>
  `${point.x}:${point.y}:${point.z}`;

export const cellIdToPoint = (cellId: SerializedCoords): Point3D => {
  const [x, y, z] = cellId.split(':').map(Number);

  return { x, y, z };
};
