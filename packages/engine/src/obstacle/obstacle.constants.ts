import type { Values } from '@game/shared';

export const OBSTACLE_EVENTS = {
  OBSTACLE_BEFORE_ATTACKED: 'obstacle_before_attacked',
  OBSTACLE_AFTER_ATTACKED: 'obstacle_after_attacked',
  OBSTACLE_BEFORE_TAKE_DAMAGE: 'obstacle_before_take_damage',
  OBSTACLE_AFTER_TAKE_DAMAGE: 'obstacle_after_take_damage',
  OBSTACLE_BEFORE_DESTROY: 'obstacle_before_destroyed',
  OBSTACLE_AFTER_DESTROY: 'obstacle_after_destroyed'
} as const;

export type ObstacleEvent = Values<typeof OBSTACLE_EVENTS>;
