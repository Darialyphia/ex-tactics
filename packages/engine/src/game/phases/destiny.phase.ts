import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import { type EmptyObject, type Serializable } from '@game/shared';
import type { DestinyCard } from '../../card/entities/destiny.entity';

export class DestinyPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async playDestinyCard(card: DestinyCard) {
    await this.game.gamePhaseSystem.currentPlayer.playDestinyCard(card);
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.GO_TO_MAIN_PHASE
    );
  }

  async skipDestinyPhase() {
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.GO_TO_MAIN_PHASE
    );
  }

  private async recollect() {
    const cards = [...this.game.gamePhaseSystem.currentPlayer.cardManager.destinyZone];

    for (const card of cards) {
      await card.removeFromCurrentLocation();
      if (card.canBeRecollected) {
        await card.player.cardManager.addToHand(card);
      } else {
        await card.player.cardManager.sendToDiscardPile(card);
      }
    }
  }

  async onEnter() {}

  async onExit() {
    await this.recollect();
  }

  serialize(): EmptyObject {
    return {};
  }
}
