import { assert, type Nullable } from '@game/shared';
import { System } from '../../system';
import { EffectChain, type Effect } from '../effect-chain';
import type { Player } from '../../player/player.entity';

export class EffectChainSystem extends System<never> {
  private _currentChain: Nullable<EffectChain> = null;

  initialize() {}

  shutdown() {}

  createChain(player: Player, initialEffect?: Effect) {
    return new Promise<void>(resolve => {
      this._currentChain = new EffectChain(this.game, player, () => {
        this._currentChain = null;
        resolve();
      });

      if (initialEffect) {
        this._currentChain.addEffect(initialEffect, player);
      }
      return this.game.inputSystem.askForPlayerInput();
    });
  }

  get currentChain() {
    return this._currentChain;
  }

  addEffect(effect: Effect, player: Player) {
    assert(this._currentChain, 'No active effect chain');
    this._currentChain.addEffect(effect, player);
  }

  pass(player: Player) {
    assert(this._currentChain, 'No active effect chain');
    this._currentChain.pass(player);
  }

  serialize() {
    return this._currentChain?.serialize() ?? null;
  }
}
