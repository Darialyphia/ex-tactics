import type { Values } from '@game/shared';

export const UNIT_EVENTS = {
  UNIT_TURN_START: 'unit_turn_start',
  UNIT_TURN_END: 'unit_end_turn',
  UNIT_BEFORE_DESTROY: 'unit_before_destroy',
  UNIT_AFTER_DESTROY: 'unit_after_destroy',
  UNIT_BEFORE_MOVE: 'unit_before_move',
  UNIT_AFTER_MOVE: 'unit_after_move',
  UNIT_BEFORE_ATTACK: 'unit_before_attack',
  UNIT_AFTER_ATTACK: 'unit_after_attack',
  UNIT_BEFORE_DEAL_DAMAGE: 'unit_before_deal_damage',
  UNIT_AFTER_DEAL_DAMAGE: 'unit_after_deal_damage',
  UNIT_BEFORE_RECEIVE_DAMAGE: 'unit_before_receive_damage',
  UNIT_AFTER_RECEIVE_DAMAGE: 'unit_after_receive_damage',
  UNIT_BEFORE_USE_ABILITY: 'unit_before_use_ability',
  UNIT_AFTER_USE_ABILITY: 'unit_after_use_ability',
  UNIT_BEFORE_RECEIVE_HEAL: 'unit_before_receive_heal',
  UNIT_AFTER_RECEIVE_HEAL: 'unit_after_receive_heal'
} as const;

export type UnitEvent = Values<typeof UNIT_EVENTS>;
