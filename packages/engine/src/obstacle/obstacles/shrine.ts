import type { ObstacleBlueprint } from '../obstacle-blueprint';

export const shrine: ObstacleBlueprint = {
  id: 'shrine',
  name: 'Shrine',
  description: 'Allows you to deploy your Heroes on nearby tiles.',
  sprite: {
    id: 'shrine',
    defaultParts: {}
  },
  isAttackable: true,
  isDestroyable: true,
  isWalkable: false,
  maxHp: 50,
  onInit() {},
  onAttacked(game, obstacle, source) {},
  onDestroyed(game, obstacle, source) {
    // @TODO handle victory points and win condition
  }
};
