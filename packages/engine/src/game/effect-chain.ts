import {
  assert,
  StateMachine,
  stateTransition,
  type MaybePromise,
  type Serializable,
  type Values
} from '@game/shared';
import type { Game } from './game';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';
import { GameError } from './game-error';
import {
  serializePreResponseTarget,
  type PreResponseTarget,
  type SerializedPreResponseTarget
} from '../card/card-blueprint';

const EFFECT_CHAIN_STATES = {
  BUILDING: 'BUILDING',
  RESOLVING: 'RESOLVING',
  FINISHED: 'FINISHED'
} as const;
type EffectChainState = Values<typeof EFFECT_CHAIN_STATES>;

const EFFECT_CHAIN_STATE_TRANSITIONS = {
  ADD_EFFECT: 'ADD_EFFECT',
  PASS: 'PASS',
  RESOLVE: 'RESOLVE',
  END: 'END'
} as const;
type EffectChainTransition = Values<typeof EFFECT_CHAIN_STATE_TRANSITIONS>;

export type Effect = {
  source: AnyCard;
  handler: (game: Game) => Promise<void>;
  targets: PreResponseTarget[];
};

export type SerializedEffectChain = {
  stack: Array<{
    source: string;
    targets: SerializedPreResponseTarget[];
  }>;
  player: string;
};

export class EffectChain
  extends StateMachine<EffectChainState, EffectChainTransition>
  implements Serializable<SerializedEffectChain>
{
  private effectStack: Effect[] = [];
  private consecutivePasses = 0;
  private currentPlayer: Player;
  public onResolved: () => MaybePromise<void>;

  constructor(
    private game: Game,
    startingPlayer: Player,
    onResolved: () => MaybePromise<void>
  ) {
    super(EFFECT_CHAIN_STATES.BUILDING);
    this.onResolved = async () => {
      await onResolved();
      await this.game.inputSystem.askForPlayerInput();
    };
    this.currentPlayer = startingPlayer;

    this.addTransitions([
      stateTransition(
        EFFECT_CHAIN_STATES.BUILDING,
        EFFECT_CHAIN_STATE_TRANSITIONS.ADD_EFFECT,
        EFFECT_CHAIN_STATES.BUILDING,
        this.onAddEffect.bind(this)
      ),
      stateTransition(
        EFFECT_CHAIN_STATES.BUILDING,
        EFFECT_CHAIN_STATE_TRANSITIONS.PASS,
        EFFECT_CHAIN_STATES.BUILDING,
        this.onPass.bind(this)
      ),
      stateTransition(
        EFFECT_CHAIN_STATES.BUILDING,
        EFFECT_CHAIN_STATE_TRANSITIONS.RESOLVE,
        EFFECT_CHAIN_STATES.RESOLVING
      ),
      stateTransition(
        EFFECT_CHAIN_STATES.RESOLVING,
        EFFECT_CHAIN_STATE_TRANSITIONS.END,
        EFFECT_CHAIN_STATES.FINISHED,
        this.onEnd.bind(this)
      )
    ]);
  }

  get size() {
    return this.effectStack.length;
  }

  private onAddEffect() {
    this.consecutivePasses = 0;
    this.switchTurn();
  }

  private get passesNeededToResolve() {
    // return this.effectStack.length <= 1 ? 1 : 2;
    return 2;
  }

  isCurrentPlayer(player: Player): boolean {
    return player.equals(this.currentPlayer);
  }

  private onPass() {
    this.consecutivePasses++;
    if (this.consecutivePasses >= this.passesNeededToResolve) {
      this.dispatch(EFFECT_CHAIN_STATE_TRANSITIONS.RESOLVE);
      void this.resolveEffects();
    } else {
      this.switchTurn();
    }
  }

  private onEnd() {
    void this.onResolved();
  }

  private async resolveEffects() {
    while (this.effectStack.length > 0) {
      const effect = this.effectStack.pop();
      if (effect) await effect.handler(this.game);
    }
    this.dispatch(EFFECT_CHAIN_STATE_TRANSITIONS.END);
  }

  private switchTurn(): void {
    this.currentPlayer = this.currentPlayer.opponent;
  }

  addEffect(effect: Effect, player: Player): void {
    assert(
      this.can(EFFECT_CHAIN_STATE_TRANSITIONS.ADD_EFFECT),
      new InactiveEffectChainError()
    );
    assert(player.equals(this.currentPlayer), new IllegalPlayerResponseError());

    this.effectStack.push(effect);
    this.dispatch(EFFECT_CHAIN_STATE_TRANSITIONS.ADD_EFFECT);
  }

  pass(player: Player): void {
    assert(this.can(EFFECT_CHAIN_STATE_TRANSITIONS.PASS), new InactiveEffectChainError());
    assert(player.equals(this.currentPlayer), new IllegalPlayerResponseError());

    this.dispatch(EFFECT_CHAIN_STATE_TRANSITIONS.PASS);
  }

  canAddEffect(player: Player): boolean {
    return (
      player.equals(this.currentPlayer) &&
      this.can(EFFECT_CHAIN_STATE_TRANSITIONS.ADD_EFFECT)
    );
  }

  serialize(): SerializedEffectChain {
    return {
      stack: this.effectStack.map(effect => ({
        source: effect.source.id,
        targets: effect.targets.map(serializePreResponseTarget)
      })),
      player: this.currentPlayer.id
    };
  }
}

export class IllegalPlayerResponseError extends GameError {
  constructor() {
    super('Illegal player response');
  }
}

export class ChainAlreadyStartedError extends GameError {
  constructor() {
    super('Effect chain is already started');
  }
}

export class InactiveEffectChainError extends GameError {
  constructor() {
    super('No effect chain is currently active');
  }
}
