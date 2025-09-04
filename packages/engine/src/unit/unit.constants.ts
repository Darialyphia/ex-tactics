import type { Values } from '@game/shared';

export const UNIT_EVENTS = {
  UNIT_TURN_START: 'unit_turn_start',
  UNIT_TURN_END: 'unit_end_turn',
  UNIT_BEFORE_DESTROY: 'unit_before_destroy',
  UNIT_AFTER_DESTROY: 'unit_after_destroy'
} as const;

export type UnitEvent = Values<typeof UNIT_EVENTS>;
