import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { assert } from '@game/shared';
import { IllegalCardPlayedError, NotCurrentPlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  id: z.string()
});

export class PlayDestinyCardInput extends Input<typeof schema> {
  readonly name = 'playDestinyCard';

  readonly allowedPhases = [GAME_PHASES.DESTINY];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());

    const card = this.player.cardManager.getDestinyCardById(this.payload.id);
    assert(card, new IllegalCardPlayedError());

    await this.game.gamePhaseSystem
      .getContext<GamePhasesDict['DESTINY']>()
      .ctx.playDestinyCard(card);
  }
}
