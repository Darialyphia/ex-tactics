import { isDefined } from '@game/shared';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';

export class PassChainGlobalAction implements GlobalActionRule {
  readonly variant = 'error' as const;

  readonly id = 'pass-chain';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return 'Pass';
  }

  shouldDisplay(state: GameClientState): boolean {
    return (
      isDefined(state.effectChain) &&
      state.effectChain.player === this.client.playerId &&
      state.interaction.state === INTERACTION_STATES.IDLE
    );
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    this.client.passChain();
  }
}
