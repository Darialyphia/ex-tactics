import { keyBy } from 'lodash-es';
import type { Tile } from './tile';

export const TILES: Record<string, Tile> = keyBy(
  [
    {
      id: 'grass',
      spriteId: 'grass',
      isWalkable: true,
      isRamp: false
    }
  ],
  'id'
);
