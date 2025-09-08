import type { ObstacleBlueprint } from '../obstacle-blueprint';

export const shrine: ObstacleBlueprint = {
  id: 'shrine',
  name: 'Shrine',
  description: 'Allows you to deploy your Heroes on nearby tiles.',
  spriteId: 'shrine',
  isAttackable: true,
  isDestroyable: true,
  isWalkable: false,
  maxHp: 50,
  onInit() {}
};
