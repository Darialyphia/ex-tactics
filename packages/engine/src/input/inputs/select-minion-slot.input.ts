import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';
import { type InteractionStateDict } from '../../game/systems/game-interaction.system';
import { GAME_PHASES } from '../../game/game.enums';
import { IllegalTargetError } from '../input-errors';

const schema = defaultInputSchema.extend({
  slot: z.object({
    zone: z.enum(['attack', 'defense']),
    slot: z.number(),
    player: z.string()
  })
});

export class SelectMinionSlotInput extends Input<typeof schema> {
  readonly name = 'selectMinionSlot';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['SELECTING_MINION_SLOT']>();

    const player = this.game.playerSystem.getPlayerById(this.payload.slot.player);
    if (!player) {
      throw new IllegalTargetError();
    }
    await interactionContext.ctx.selectPosition(this.player, {
      zone: this.payload.slot.zone,
      slot: this.payload.slot.slot,
      player
    });
  }
}
