import type { MapBlueprint } from '../map-blueprint';

export const testMap: MapBlueprint = {
  id: 'test-map',
  cols: 10,
  rows: 10,
  cells: [...Array(500).fill({ tile: 'dirt' }), ...Array(100).fill({ tile: 'grass' })],
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
