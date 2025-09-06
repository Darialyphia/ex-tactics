import type { Values } from '@game/shared';

export const TARGETING_TYPES = {
  ALLY: 'ally',
  ENEMY: 'enemy',
  OBSTACLE: 'obstacle',
  UNIT: 'unit',
  EMPTY: 'empty',
  ANY: 'any'
} as const;

export type TargetingType = Values<typeof TARGETING_TYPES>;
