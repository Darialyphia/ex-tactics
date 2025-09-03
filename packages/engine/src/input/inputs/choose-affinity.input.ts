import { AFFINITIES, type Affinity } from '../../card/card.enums';
import { GAME_PHASES } from '../../game/game.enums';
import type { InteractionStateDict } from '../../game/systems/game-interaction.system';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';

const schema = defaultInputSchema.extend({
  affinity: z.enum(Object.values(AFFINITIES) as [Affinity, ...Affinity[]])
});

export class ChooseAffinityInput extends Input<typeof schema> {
  readonly name = 'chooseAffinity';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['CHOOSING_AFFINITY']>();

    interactionContext.ctx.commit(this.player, this.payload.affinity);
  }
}
