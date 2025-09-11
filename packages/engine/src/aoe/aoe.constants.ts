import type { Values } from '@game/shared';

export const TARGETING_TYPES = {
  ALLY: 'ally',
  ENEMY: 'enemy',
  OBSTACLE: 'obstacle',
  NON_ALLY: 'non-ally', // enemy or obstacle
  UNIT: 'unit',
  EMPTY: 'empty',
  ANY: 'any'
} as const;

export type TargetingType = Values<typeof TARGETING_TYPES>;
