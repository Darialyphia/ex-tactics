import { shrine } from '../../obstacle/obstacles/shrine';
import { DIRECTION } from '../board.utils';
import type { MapBlueprint } from '../map-blueprint';

export const testMap: MapBlueprint = {
  id: 'testMap',
  cols: 12,
  rows: 10,
  cells: [...Array(12 * 10).fill({ tile: 'grass' })],
  players: [
    {
      obstacles: [
        {
          blueprintId: shrine.id,
          position: { x: 2, y: 2, z: 0 },
          orientation: DIRECTION.EAST,
          parts: {
            runes: 'player1'
          }
        },
        {
          blueprintId: shrine.id,
          position: { x: 2, y: 7, z: 0 },
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
          position: { x: 9, y: 2, z: 0 },
          orientation: DIRECTION.WEST,
          parts: {
            runes: 'player2'
          }
        },
        {
          blueprintId: shrine.id,
          position: { x: 9, y: 7, z: 0 },
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
