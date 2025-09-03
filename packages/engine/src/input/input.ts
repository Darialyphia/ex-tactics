import { z } from 'zod';
import {
  assert,
  type JSONValue,
  type MaybePromise,
  type Serializable
} from '@game/shared';
import type { Game } from '../game/game';
import { MissingPayloadError, WrongGamePhaseError } from './input-errors';
import type { GamePhase } from '../game/game.enums';

export const defaultInputSchema = z.object({
  playerId: z.string()
});
export type DefaultSchema = typeof defaultInputSchema;

export type AnyGameAction = Input<any>;

export abstract class Input<TSchema extends DefaultSchema>
  implements Serializable<{ type: string; payload: z.infer<TSchema> }>
{
  abstract readonly allowedPhases: GamePhase[];

  abstract readonly name: string;

  protected abstract payloadSchema: TSchema;

  protected payload!: z.infer<TSchema>;

  constructor(
    protected game: Game,
    readonly id: number,
    protected rawPayload: JSONValue
  ) {}

  protected abstract impl(): MaybePromise<void>;

  private parsePayload() {
    const parsed = this.payloadSchema.safeParse(this.rawPayload);
    assert(parsed.success, parsed.error?.message);

    this.payload = parsed.data;
  }

  get player() {
    return this.game.playerSystem.getPlayerById(this.payload.playerId)!;
  }

  get isValidPhase() {
    return this.allowedPhases.includes(this.game.gamePhaseSystem.getContext().state);
  }

  async execute() {
    this.parsePayload();

    assert(this.payload, new MissingPayloadError());
    assert(this.isValidPhase, new WrongGamePhaseError());

    await this.impl();
  }

  serialize() {
    return {
      type: this.name,
      payload: this.payload
    };
  }
}
