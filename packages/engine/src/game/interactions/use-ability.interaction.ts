import { assert } from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import {
  InvalidPlayerError,
  INTERACTION_STATE_TRANSITIONS
} from '../systems/game-interaction.system';
import type { Ability, AbilityOwner } from '../../card/entities/ability.entity';

type UseAbilityContextOptions = {
  ability: Ability<AbilityOwner>;
  player: Player;
};

export class UseAbilityContext {
  static async create(
    game: Game,
    options: UseAbilityContextOptions
  ): Promise<UseAbilityContext> {
    const instance = new UseAbilityContext(game, options);
    await instance.init();
    return instance;
  }

  private ability: Ability<AbilityOwner>;

  readonly player: Player;

  private constructor(
    private game: Game,
    options: UseAbilityContextOptions
  ) {
    this.player = options.player;
    this.ability = options.ability;
  }

  async init() {}

  serialize() {
    return {
      ability: this.ability.id,
      card: this.ability.card.id,
      player: this.player.id
    };
  }

  async commit(player: Player, manaCostIndices: number[]) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.COMMIT_USING_ABILITY);
    this.game.interaction.onInteractionEnd();

    await this.player.useAbility(this.ability, manaCostIndices);
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(INTERACTION_STATE_TRANSITIONS.CANCEL_USING_ABILITY);
    this.game.interaction.onInteractionEnd();
  }
}
