import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { assert } from '@game/shared';
import { NotCurrentPlayerError } from '../input-errors';

const schema = defaultInputSchema;

export class SkipDestinyInput extends Input<typeof schema> {
  readonly name = 'skipDestiny';

  readonly allowedPhases = [GAME_PHASES.DESTINY];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());

    await this.game.gamePhaseSystem
      .getContext<GamePhasesDict['DESTINY']>()
      .ctx.skipDestinyPhase();
  }
}
