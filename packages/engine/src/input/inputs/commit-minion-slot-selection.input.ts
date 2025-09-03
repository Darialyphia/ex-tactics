import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { type InteractionStateDict } from '../../game/systems/game-interaction.system';

const schema = defaultInputSchema;

export class CommitMinionSlotSelectionInput extends Input<typeof schema> {
  readonly name = 'commitMinionSlotSelection';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['SELECTING_MINION_SLOT']>();

    interactionContext.ctx.commit(this.player);
  }
}
