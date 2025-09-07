import { z } from 'zod';
import { assert, type JSONValue, type Serializable } from '@game/shared';
import type { Game } from '../game/game';
import { MissingPayloadError, WrongRoundPhaseError } from './input-errors';
import type { TurnPhase } from '../game/systems/turn.system';

export const defaultInputSchema = z.object({
  playerId: z.string()
});
export type DefaultSchema = typeof defaultInputSchema;

export type AnyGameAction = Input<any>;

export abstract class Input<TSchema extends DefaultSchema>
  implements Serializable<{ type: string; payload: z.infer<TSchema> }>
{
  abstract readonly name: string;

  protected abstract payloadSchema: TSchema;

  protected payload!: z.infer<TSchema>;

  protected abstract allowedPhases: TurnPhase[];

  constructor(
    protected game: Game,
    readonly id: number,
    protected rawPayload: JSONValue
  ) {}

  get player() {
    return this.game.playerManager.getPlayerById(this.payload.playerId);
  }

  protected abstract impl(): void;

  private parsePayload() {
    const parsed = this.payloadSchema.safeParse(this.rawPayload);
    assert(parsed.success, parsed.error?.message);

    this.payload = parsed.data;
  }

  execute() {
    this.parsePayload();

    assert(this.payload, new MissingPayloadError());
    assert(
      this.allowedPhases.includes(this.game.turnSystem.phase),
      new WrongRoundPhaseError()
    );

    this.impl();
  }

  serialize() {
    return {
      type: this.name,
      payload: this.payload
    };
  }
}
