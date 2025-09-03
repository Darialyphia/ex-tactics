import { GAME_PHASES } from '../../game/game.enums';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';

export class CommitMinionSlotSelectionGlobalAction implements GlobalActionRule {
  readonly variant = 'info' as const;

  readonly id = 'commit-minion-slot-selection';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return 'Confirm';
  }

  shouldDisplay(state: GameClientState): boolean {
    return (
      state.interaction.state === INTERACTION_STATES.SELECTING_MINION_SLOT &&
      state.interaction.ctx.player === this.client.playerId &&
      state.interaction.ctx.canCommit
    );
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    this.client.commitMinionSlotSelection();
  }
}
