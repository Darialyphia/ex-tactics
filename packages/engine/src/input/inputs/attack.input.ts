import { z } from 'zod';
import { TURN_PHASES } from '../../game/systems/turn.system';
import { defaultInputSchema, Input } from '../input';
import { assert, Vec3 } from '@game/shared';
import { IllegalAttackTargetError, NotActivePlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export class AttackInput extends Input<typeof schema> {
  readonly name = 'attack';

  readonly allowedPhases = [TURN_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(this.player.isActive, new NotActivePlayerError());

    assert(
      this.game.turnSystem.activeUnit.canAttackAt(this.payload),
      new IllegalAttackTargetError()
    );

    this.game.turnSystem.activeUnit.attack(Vec3.fromPoint3D(this.payload));
  }
}
