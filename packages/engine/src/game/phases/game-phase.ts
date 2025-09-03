import type { GamePhase } from '../game.enums';

export type GamePhaseController = {
  onEnter(from: GamePhase | null): Promise<void>;
  onExit(to: GamePhase): Promise<void>;
};
