import { GAME_PHASES } from '../../game/game.enums';
import { COMBAT_STEPS } from '../../game/phases/combat.phase';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';

export class SkipBlockGlobalAction implements GlobalActionRule {
  readonly variant = 'error' as const;

  readonly id = 'skip-block';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return 'Skip Block';
  }

  shouldDisplay(state: GameClientState): boolean {
    return (
      state.phase.state === GAME_PHASES.ATTACK &&
      state.phase.ctx.step === COMBAT_STEPS.DECLARE_BLOCKER &&
      state.currentPlayer !== this.client.playerId
    );
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    this.client.skipBlock();
  }
}
