import { shrine } from '../../obstacle/obstacles/shrine';
import { DIRECTION } from '../board.utils';
import type { MapBlueprint } from '../map-blueprint';

export const testMap: MapBlueprint = {
  id: 'testMap',
  cols: 9,
  rows: 7,
  cells: [...Array(9 * 7).fill({ tile: 'grass' })],
  players: [
    {
      obstacles: [
        {
          blueprintId: shrine.id,
          position: { x: 2, y: 3, z: 0 },
          orientation: DIRECTION.EAST,
          parts: {
            runes: 'player1'
          }
        }
      ]
    },
    {
      obstacles: [
        {
          blueprintId: shrine.id,
          position: { x: 6, y: 3, z: 0 },
          orientation: DIRECTION.WEST,
          parts: {
            runes: 'player2'
          }
        }
      ]
    }
  ],
  onInit() {}
};
