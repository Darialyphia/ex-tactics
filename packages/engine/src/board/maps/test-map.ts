import type { MapBlueprint } from '../map-blueprint';

export const testMap: MapBlueprint = {
  id: 'testMap',
  cols: 20,
  rows: 20,
  cells: [...Array(400).fill({ tile: 'grass' })],
  players: [
    {
      obstacles: []
    },
    {
      obstacles: []
    }
  ],
  onInit() {}
};
