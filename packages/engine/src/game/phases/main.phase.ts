import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import type { EmptyObject, Serializable } from '@game/shared';

export class MainPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async declareAttack() {
    return this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.DECLARE_ATTACK
    );
  }

  async onEnter() {}

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
