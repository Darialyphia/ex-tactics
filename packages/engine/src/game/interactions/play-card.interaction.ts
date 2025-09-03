import { assert } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import {
  InvalidPlayerError,
  INTERACTION_STATE_TRANSITIONS
} from '../systems/game-interaction.system';
import type { MainDeckCard } from '../../board/board.system';

type PlayCardContextOptions = {
  card: MainDeckCard;
  player: Player;
};

export class PlayCardContext {
  static async create(
    game: Game,
    options: PlayCardContextOptions
  ): Promise<PlayCardContext> {
    const instance = new PlayCardContext(game, options);
    await instance.init();
    return instance;
  }

  private card: MainDeckCard;
  private cardIndexInHand: number;

  readonly player: Player;

  private constructor(
    private game: Game,
    options: PlayCardContextOptions
  ) {
    this.player = options.player;
    this.card = options.card;
    this.cardIndexInHand = this.player.cardManager.hand.findIndex(c =>
      c.equals(this.card)
    );
  }

  async init() {
    this.card.removeFromCurrentLocation();
  }

  serialize() {
    return {
      card: this.card.id,
      player: this.player.id
    };
  }

  async commit(player: Player, manaCostIndices: number[]) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_PLAYING_CARD);
    this.game.interaction.onInteractionEnd();

    await this.player.playMainDeckCard(this.card, manaCostIndices);
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this.card.player.cardManager.addToHand(this.card, this.cardIndexInHand);
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.CANCEL_PLAYING_CARD);
    this.game.interaction.onInteractionEnd();
  }
}
