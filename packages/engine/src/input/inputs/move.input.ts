import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert } from '@game/shared';
import { IllegalMovementError, NotActivePlayerError } from '../input-errors';
import { TURN_PHASES } from '../../game/systems/turn.system';

const schema = defaultInputSchema.extend({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export class MoveInput extends Input<typeof schema> {
  readonly name = 'move';

  readonly allowedPhases = [TURN_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(this.player.isActive, new NotActivePlayerError());

    assert(
      this.game.turnSystem.activeUnit.canMoveTo(this.payload),
      new IllegalMovementError(this.payload)
    );

    this.game.turnSystem.activeUnit.move(this.payload);
  }
}
