import { z } from 'zod';
import { TURN_PHASES } from '../../game/systems/turn.system';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined, Vec3 } from '@game/shared';
import {
  IllegalAbilityError,
  IllegalAttackTargetError,
  NotActivePlayerError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  abilityId: z.string(),
  target: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  })
});

export class UseAbilityInput extends Input<typeof schema> {
  readonly name = 'useAbility';

  readonly allowedPhases = [TURN_PHASES.BATTLE];

  protected payloadSchema = schema;

  get ability() {
    return this.game.turnSystem.activeUnit.abilities.find(
      a => a.id === this.payload.abilityId
    );
  }

  impl() {
    assert(this.player.isActive, new NotActivePlayerError());
    assert(isDefined(this.ability), new IllegalAbilityError());
    assert(
      this.ability.canUseAt(Vec3.fromPoint3D(this.payload.target)),
      new IllegalAttackTargetError()
    );
    assert(
      this.game.turnSystem.activeUnit.canUseAbility(this.ability),
      new IllegalAbilityError()
    );

    this.game.turnSystem.activeUnit.useAbility(
      this.ability.id,
      Vec3.fromPoint3D(this.payload.target)
    );
  }
}
