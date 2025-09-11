import type { MapBlueprint } from '../map-blueprint';

export const testMap: MapBlueprint = {
  id: 'testMap',
  cols: 20,
  rows: 20,
  cells: [...Array(1600).fill({ tile: 'dirt' }), ...Array(200).fill({ tile: 'grass' })],
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
