import { GAME_PHASES } from '../../game/game.enums';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';

export class CancelPlayCardGlobalAction implements GlobalActionRule {
  readonly variant = 'primary' as const;

  readonly id = 'cancel-play-card';

  constructor(private client: GameClient) {}

  getLabel(): string {
    return 'Cancel';
  }

  shouldDisplay(state: GameClientState): boolean {
    return (
      state.interaction.state === INTERACTION_STATES.PLAYING_CARD &&
      state.interaction.ctx.player === this.client.playerId
    );
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    this.client.cancelPlayCard();
  }
}
