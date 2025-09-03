import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  IllegalAttackTargetError,
  NotCurrentPlayerError,
  UnknownUnitError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  targetId: z.string()
});

export class DeclareAttackTargetInput extends Input<typeof schema> {
  readonly name = 'declareAttackTarget';

  readonly allowedPhases = [GAME_PHASES.ATTACK];

  protected payloadSchema = schema;

  get target() {
    return [this.player.opponent.hero, ...this.player.enemyMinions].find(
      creature => creature.id === this.payload.targetId
    );
  }

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());
    assert(this.target, new UnknownUnitError(this.payload.targetId));
    assert(this.target.canBeAttacked, new IllegalAttackTargetError());

    await this.game.gamePhaseSystem
      .getContext<GamePhasesDict['ATTACK']>()
      .ctx.declareAttackTarget(this.target);
  }
}
