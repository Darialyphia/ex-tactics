import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  IllegalAttackerError,
  NotCurrentPlayerError,
  UnknownUnitError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  attackerId: z.string()
});

export class DeclareAttackInput extends Input<typeof schema> {
  readonly name = 'declareAttack';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  get attacker() {
    if (this.player.hero.id === this.payload.attackerId) {
      return this.player.hero;
    }
    return this.player.minions.find(creature => creature.id === this.payload.attackerId);
  }

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());
    assert(this.attacker, new UnknownUnitError(this.payload.attackerId));
    assert(this.attacker.canAttack, new IllegalAttackerError());

    await this.game.gamePhaseSystem.startCombat();
    await this.game.gamePhaseSystem
      .getContext<GamePhasesDict['ATTACK']>()
      .ctx.declareAttacker(this.attacker);
  }
}
