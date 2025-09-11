import { keyBy } from 'lodash-es';
import type { Tile } from './tile';

export const TILES: Record<string, Tile> = keyBy(
  [
    {
      id: 'grass',
      spriteId: 'grass',
      isWalkable: true
    },
    {
      id: 'dirt',
      spriteId: 'dirt',
      isWalkable: true
    }
  ],
  'id'
);
