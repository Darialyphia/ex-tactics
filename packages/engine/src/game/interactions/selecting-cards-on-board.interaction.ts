import { assert } from '@game/shared';
import type { AnyCard, CardTargetOrigin } from '../../card/entities/card.entity';
import { IllegalTargetError } from '../../input/input-errors';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import {
  InvalidPlayerError,
  UnableToCommitError,
  INTERACTION_STATE_TRANSITIONS
} from '../systems/game-interaction.system';

type SelectingCardOnBoardContextOptions = {
  player: Player;
  isElligible: (card: AnyCard, selectedCards: AnyCard[]) => boolean;
  canCommit: (selectedCards: AnyCard[]) => boolean;
  isDone(selectedCards: AnyCard[]): boolean;
  origin: CardTargetOrigin;
};

export class SelectingCardOnBoardContext {
  static async create(game: Game, options: SelectingCardOnBoardContextOptions) {
    const instance = new SelectingCardOnBoardContext(game, options);
    await instance.init();
    return instance;
  }
  private selectedCards: AnyCard[] = [];

  private origin: CardTargetOrigin;

  private isElligible: (card: AnyCard, selectedCards: AnyCard[]) => boolean;

  private canCommit: (selectedCards: AnyCard[]) => boolean;

  private isDone: (selectedCards: AnyCard[]) => boolean;

  readonly player: Player;

  private constructor(
    private game: Game,
    options: SelectingCardOnBoardContextOptions
  ) {
    this.player = options.player;
    this.isElligible = options.isElligible;
    this.canCommit = options.canCommit;
    this.isDone = options.isDone;
    this.origin = options.origin;
  }

  serialize() {
    return {
      player: this.player.id,
      selectedCards: this.selectedCards.map(card => card.id),
      elligibleCards: this.game.boardSystem
        .getAllCardsInPlay()
        .filter(card => this.isElligible(card, this.selectedCards))
        .map(card => card.id),
      canCommit: this.canCommit(this.selectedCards)
    };
  }

  async init() {}

  private async autoCommitIfAble() {
    const isDone = this.isDone(this.selectedCards);
    const canCommit = this.canCommit(this.selectedCards);
    if (isDone && canCommit) {
      this.commit(this.player);
    } else {
      await this.game.inputSystem.askForPlayerInput();
    }
  }

  async selectCard(player: Player, card: AnyCard) {
    assert(player.equals(this.player), new InvalidPlayerError());
    assert(this.isElligible(card, this.selectedCards), new IllegalTargetError());
    this.selectedCards.push(card);
    card.targetBy(this.origin);
    await this.autoCommitIfAble();
  }

  commit(player: Player) {
    assert(this.canCommit, new UnableToCommitError());
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(
      INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_CARDS_ON_BOARD
    );
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedCards);
  }
}
