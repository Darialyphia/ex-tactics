import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert } from '@game/shared';
import { TURN_PHASES } from '../../game/systems/turn.system';
import { NotActivePlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export class EndTurnInput extends Input<typeof schema> {
  readonly name = 'endTurn';

  protected payloadSchema = schema;

  protected allowedPhases = [TURN_PHASES.BATTLE];

  impl() {
    assert(this.player.isActive, new NotActivePlayerError());

    this.game.turnSystem.activeUnit.endTurn();
  }
}
