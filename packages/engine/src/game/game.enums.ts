import type { Values } from '@game/shared';

export const GAME_PHASES = {
  DEPLOY: 'deploy',
  BATTLE: 'battle',
  GAME_END: 'game_end'
} as const;
export type GamePhasesDict = typeof GAME_PHASES;
export type GamePhase = Values<typeof GAME_PHASES>;

export const GAME_PHASE_EVENTS = {
  GAME_TURN_START: 'game_phase_turn_start',
  GAME_TURN_END: 'game_phase_turn_end'
} as const;
export type GamePhaseEventName = Values<typeof GAME_PHASE_EVENTS>;
