import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { type InteractionStateDict } from '../../game/systems/game-interaction.system';
import { z } from 'zod';

const schema = defaultInputSchema.extend({
  manaCostIndices: z.array(z.number())
});

export class CommitPlayCardInput extends Input<typeof schema> {
  readonly name = 'commitPlayCard';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['PLAYING_CARD']>();

    await interactionContext.ctx.commit(this.player, this.payload.manaCostIndices);
  }
}
