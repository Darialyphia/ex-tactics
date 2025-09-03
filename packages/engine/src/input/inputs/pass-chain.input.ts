import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { NoOngoingEffectChainsError } from '../input-errors';

const schema = defaultInputSchema;

export class PassChainInput extends Input<typeof schema> {
  readonly name = 'passChain';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  impl() {
    assert(this.game.effectChainSystem.currentChain, new NoOngoingEffectChainsError());
    this.game.effectChainSystem.pass(this.player);
  }
}
