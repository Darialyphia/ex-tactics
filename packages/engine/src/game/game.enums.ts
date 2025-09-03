import type { Values } from '@game/shared';

export const GAME_PHASES = {
  DRAW: 'draw_phase',
  DESTINY: 'destiny_phase',
  MAIN: 'main_phase',
  ATTACK: 'attack_phase',
  END: 'end_phase',
  GAME_END: 'game_end'
} as const;
export type GamePhasesDict = typeof GAME_PHASES;
export type GamePhase = Values<typeof GAME_PHASES>;

export const GAME_PHASE_EVENTS = {
  GAME_TURN_START: 'game_phase_turn_start',
  GAME_TURN_END: 'game_phase_turn_end',
  BEFORE_CHANGE_PHASE: 'game_phase_before_change_phase',
  AFTER_CHANGE_PHASE: 'game_phase_after_change_phase'
} as const;
export type GamePhaseEventName = Values<typeof GAME_PHASE_EVENTS>;
