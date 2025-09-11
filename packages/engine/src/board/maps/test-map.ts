import { shrine } from '../../obstacle/obstacles/shrine';
import { DIRECTION } from '../board.utils';
import type { MapBlueprint } from '../map-blueprint';

export const testMap: MapBlueprint = {
  id: 'testMap',
  cols: 20,
  rows: 13,
  cells: [...Array(20 * 13).fill({ tile: 'grass' })],
  players: [
    {
      obstacles: [
        {
          blueprintId: shrine.id,
          position: { x: 2, y: 6, z: 0 },
          orientation: DIRECTION.EAST,
          parts: {
            runes: 'player1',
            glow: 'player1'
          }
        }
      ]
    },
    {
      obstacles: [
        {
          blueprintId: shrine.id,
          position: { x: 17, y: 6, z: 0 },
          orientation: DIRECTION.WEST,
          parts: {
            runes: 'player2',
            glow: 'player2'
          }
        }
      ]
    }
  ],
  onInit() {}
};
