import z from 'zod';
import { defaultInputSchema, Input } from '../input';

const schema = defaultInputSchema.extend({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export class MoveInput extends Input<typeof schema> {
  readonly name = 'move';

  protected payloadSchema = schema;

  impl() {
    console.log('TODO implement move');
  }
}
