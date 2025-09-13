import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert } from '@game/shared';
import { IllegalDeploymentError } from '../input-errors';
import { ROUND_PHASES } from '../../game/systems/turn.system';

const schema = defaultInputSchema.extend({
  heroes: z.array(
    z.object({
      blueprintId: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
      }),
      orientation: z.enum(['north', 'south', 'east', 'west'])
    })
  )
});

export class DeployInput extends Input<typeof schema> {
  readonly name = 'deploy';

  readonly allowedPhases = [ROUND_PHASES.DEPLOY];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.payload.heroes.every(h => this.player.canDeployHeroAt(h.position)),
      new IllegalDeploymentError()
    );

    this.player.deployHeroes(this.payload.heroes);
  }
}
