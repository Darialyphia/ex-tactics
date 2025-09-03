import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import type { EmptyObject, Serializable } from '@game/shared';

export class GameEndPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async onEnter() {}

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
