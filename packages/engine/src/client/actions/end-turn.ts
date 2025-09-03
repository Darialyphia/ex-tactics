import { GAME_PHASES } from '../../game/game.enums';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';

export class EndTurnGlobalAction implements GlobalActionRule {
  readonly variant = 'error' as const;

  readonly id = 'end-turn';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return 'End Turn';
  }

  shouldBeDisabled() {
    return false;
  }

  shouldDisplay(state: GameClientState) {
    return (
      state.phase.state === GAME_PHASES.MAIN &&
      state.interaction.state === INTERACTION_STATES.IDLE &&
      this.client.playerId === state.currentPlayer &&
      !state.effectChain
    );
  }

  onClick(): void {
    this.client.endTurn();
  }
}
