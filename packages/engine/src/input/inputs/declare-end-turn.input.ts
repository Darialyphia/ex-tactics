import { assert } from '@game/shared';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { NotCurrentPlayerError } from '../input-errors';

const schema = defaultInputSchema;

export class DeclareEndTurnInput extends Input<typeof schema> {
  readonly name = 'declareEndTurn';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.game.gamePhaseSystem.currentPlayer.equals(this.player),
      new NotCurrentPlayerError()
    );

    await this.game.gamePhaseSystem.declareEndPhase();
  }
}
