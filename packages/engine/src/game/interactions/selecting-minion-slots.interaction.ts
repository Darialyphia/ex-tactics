import { assert } from '@game/shared';
import type { MinionSlot } from '../../board/board-side.entity';
import { IllegalTargetError } from '../../input/input-errors';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import {
  InvalidPlayerError,
  UnableToCommitError,
  INTERACTION_STATE_TRANSITIONS
} from '../systems/game-interaction.system';

export type MinionPosition = {
  player: Player;
  slot: MinionSlot;
  zone: 'attack' | 'defense';
};

type SelectingMinionSlotsContextOptions = {
  isElligible: (position: MinionPosition, selectedSlots: MinionPosition[]) => boolean;
  canCommit: (selectedSlots: MinionPosition[]) => boolean;
  isDone(selectedSlots: MinionPosition[]): boolean;
  player: Player;
};

export class SelectingMinionSlotsContext {
  static async create(
    game: Game,
    options: SelectingMinionSlotsContextOptions
  ): Promise<SelectingMinionSlotsContext> {
    const instance = new SelectingMinionSlotsContext(game, options);
    await instance.init();
    return instance;
  }

  private selectedPositions: MinionPosition[] = [];

  private isElligible: (
    position: MinionPosition,
    selectedSlots: MinionPosition[]
  ) => boolean;

  private canCommit: (selectedSlots: MinionPosition[]) => boolean;

  private isDone: (selectedSlots: MinionPosition[]) => boolean;

  readonly player: Player;

  private constructor(
    private game: Game,
    options: SelectingMinionSlotsContextOptions
  ) {
    this.player = options.player;
    this.isElligible = options.isElligible;
    this.canCommit = options.canCommit;
    this.isDone = options.isDone;
  }

  init() {}

  private get elligiblePositions() {
    const result: MinionPosition[] = [];
    this.game.playerSystem.players.forEach(player => {
      (['attack', 'defense'] as const).forEach(zone => {
        for (let i = 0; i < this.game.config.ATTACK_ZONE_SLOTS; i++) {
          const slot = i;
          const elligible = this.isElligible(
            { player, slot, zone },
            this.selectedPositions
          );
          if (!elligible) continue;

          result.push({
            player,
            slot,
            zone
          });
        }
      });
    });

    return result;
  }

  serialize() {
    return {
      selectedPositions: this.selectedPositions.map(pos => ({
        player: pos.player.id,
        slot: pos.slot,
        zone: pos.zone
      })),
      elligiblePosition: this.elligiblePositions.map(pos => ({
        playerId: pos.player.id,
        slot: pos.slot,
        zone: pos.zone
      })),
      player: this.player.id,
      canCommit: this.canCommit(this.selectedPositions)
    };
  }

  private async autoCommitIfAble() {
    const isDone = this.isDone(this.selectedPositions);
    const canCommit = this.canCommit(this.selectedPositions);
    if (isDone && canCommit) {
      this.commit(this.player);
    } else {
      await this.game.inputSystem.askForPlayerInput();
    }
  }

  async selectPosition(player: Player, pos: MinionPosition) {
    assert(player.equals(this.player), new InvalidPlayerError());
    assert(this.isElligible(pos, this.selectedPositions), new IllegalTargetError());
    this.selectedPositions.push(pos);
    await this.autoCommitIfAble();
  }

  commit(player: Player) {
    assert(this.canCommit, new UnableToCommitError());
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(
      INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_MINION_SLOT
    );
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedPositions);
  }
}
