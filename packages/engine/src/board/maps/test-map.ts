import { shrine } from '../../obstacle/obstacles/shrine';
import { DIRECTION } from '../board.utils';
import type { MapBlueprint } from '../map-blueprint';

export const testMap: MapBlueprint = {
  id: 'testMap',
  cols: 25,
  rows: 17,
  cells: [...Array(25 * 17 + 1).fill({ tile: 'grass' })],
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
        },

        {
          blueprintId: shrine.id,
          position: { x: 5, y: 12, z: 0 },
          orientation: DIRECTION.EAST,
          parts: {
            runes: 'player1',
            glow: 'player1'
          }
        },

        {
          blueprintId: shrine.id,
          position: { x: 6, y: 3, z: 0 },
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
          position: { x: 19, y: 9, z: 0 },
          orientation: DIRECTION.WEST,
          parts: {
            runes: 'player2',
            glow: 'player2'
          }
        },
        {
          blueprintId: shrine.id,
          position: { x: 23, y: 13, z: 0 },
          orientation: DIRECTION.EAST,
          parts: {
            runes: 'player2',
            glow: 'player2'
          }
        },
        {
          blueprintId: shrine.id,
          position: { x: 20, y: 4, z: 0 },
          orientation: DIRECTION.EAST,
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
