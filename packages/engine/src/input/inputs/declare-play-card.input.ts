import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import { IllegalCardPlayedError } from '../input-errors';

const schema = defaultInputSchema.extend({
  index: z.number()
});

export class DeclarePlayCardInput extends Input<typeof schema> {
  readonly name = 'declarePlayCard';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    const card = this.player.cardManager.getCardInHandAt(this.payload.index);
    assert(card.canPlay(), new IllegalCardPlayedError());
    await this.game.interaction.declarePlayCardIntent(this.payload.index, this.player);
  }
}
