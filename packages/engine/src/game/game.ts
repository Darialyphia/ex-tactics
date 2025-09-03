import { defaultConfig, type Config } from '../config';
import { InputSystem, type SerializedInput } from '../input/input-system';
import type { Player, PlayerOptions } from '../player/player.entity';
import { RngSystem } from '../rng/rng.system';
import { TypedSerializableEventEmitter } from '../utils/typed-emitter';
import { type BetterOmit, type IndexedRecord, type Serializable } from '@game/shared';
import {
  GameSnapshotSystem,
  type GameStateSnapshot,
  type SnapshotDiff
} from './systems/game-snapshot.system';
import { PlayerSystem } from '../player/player.system';
import { GAME_EVENTS, GameReadyEvent, type GameEventMap } from './game.events';
import { GamePhaseSystem } from './systems/game-phase.system';
import { modifierIdFactory } from '../modifier/modifier.entity';
import { CardSystem } from '../card/card.system';
import type { CardBlueprint } from '../card/card-blueprint';
import { GameInteractionSystem } from './systems/game-interaction.system';
import { BoardSystem } from '../board/board.system';
import { EffectChainSystem } from './systems/effect-chain.system';
import { GAME_PHASES } from './game.enums';

export type GameOptions = {
  id: string;
  rngSeed: string;
  history?: SerializedInput[];
  overrides: Partial<{
    cardPool: IndexedRecord<CardBlueprint, 'id'>;
    config: Partial<Config>;
    winCondition: (game: Game, player: Player) => boolean;
  }>;
  isSimulation?: boolean;
  players: [PlayerOptions, PlayerOptions];
  enableSnapshots?: boolean;
};

export type SerializedGame = {
  initialState: BetterOmit<GameOptions, 'overrides'>;
  history: SerializedInput[];
};

export class Game implements Serializable<SerializedGame> {
  readonly id: string;

  private readonly emitter = new TypedSerializableEventEmitter<GameEventMap>();

  readonly config: Config;

  readonly rngSystem = new RngSystem(this);

  readonly inputSystem = new InputSystem(this);

  readonly snapshotSystem = new GameSnapshotSystem(this);

  readonly playerSystem = new PlayerSystem(this);

  readonly gamePhaseSystem = new GamePhaseSystem(this);

  readonly cardSystem = new CardSystem(this);

  readonly boardSystem = new BoardSystem(this);

  readonly effectChainSystem = new EffectChainSystem(this);

  // readonly unitSystem = new UnitSystem(this);

  // readonly interactableSystem = new InteractableSystem(this);

  readonly interaction = new GameInteractionSystem(this);

  readonly isSimulation: boolean;

  readonly modifierIdFactory = modifierIdFactory();

  readonly cardPool: IndexedRecord<CardBlueprint, 'id'>;

  constructor(readonly options: GameOptions) {
    this.id = options.id;
    this.config = Object.assign({}, defaultConfig, options.overrides.config);
    this.isSimulation = options.isSimulation ?? false;
    this.cardPool = options.overrides.cardPool ?? {};
  }

  get winCondition() {
    return (
      this.options.overrides.winCondition ??
      ((game, player) => !player.opponent.hero.isAlive)
    );
  }

  async initialize() {
    const start = performance.now();
    // const now = start;

    this.rngSystem.initialize({ seed: this.options.rngSeed });
    // console.log(`RNG initialized in ${(performance.now() - now).toFixed(0)}ms`);
    // now = performance.now();

    this.cardSystem.initialize({ cardPool: this.cardPool });
    // console.log(`Card system initialized in ${(performance.now() - now).toFixed(0)}ms`);
    // now = performance.now();

    await this.playerSystem.initialize({
      players: this.options.players
    });
    // console.log(`Player system initialized in ${(performance.now() - now).toFixed(0)}ms`);
    // now = performance.now();

    this.snapshotSystem.initialize({ enabled: this.options.enableSnapshots ?? true });
    // console.log(
    //   `Snapshot system initialized in ${(performance.now() - now).toFixed(0)}ms`
    // );
    // now = performance.now();

    this.boardSystem.initialize();
    // console.log(`Board system initialized in ${(performance.now() - now).toFixed(0)}ms`);
    // now = performance.now();

    this.interaction.initialize();
    // console.log(
    //   `Interaction system initialized in ${(performance.now() - now).toFixed(0)}ms`
    // );
    // now = performance.now();

    this.effectChainSystem.initialize();
    // console.log(
    //   `Effect chain system initialized in ${(performance.now() - now).toFixed(0)}ms`
    // );
    // now = performance.now();

    await this.gamePhaseSystem.initialize();
    // console.log(
    //   `Game phase system initialized in ${(performance.now() - now).toFixed(0)}ms`
    // );
    // now = performance.now();

    this.inputSystem.initialize();
    // console.log(`Input system initialized in ${(performance.now() - now).toFixed(0)}ms`);
    // now = performance.now();

    await this.emit(GAME_EVENTS.READY, new GameReadyEvent({}));
    await this.gamePhaseSystem.startGame();

    if (this.options.history) {
      await this.inputSystem.applyHistory(this.options.history);
    }
    this.snapshotSystem.takeSnapshot();
    console.log(
      `%cGame ${this.id} initialized in ${(performance.now() - start).toFixed(0)}ms`,
      'color: blue; font-weight: bold;'
    );
  }

  serialize() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { overrides, ...options } = this.options;
    return {
      initialState: options,
      history: this.inputSystem.serialize()
    };
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  get off() {
    return this.emitter.off.bind(this.emitter);
  }

  subscribeOmniscient(cb: (snapshot: GameStateSnapshot<SnapshotDiff>) => void) {
    this.on(GAME_EVENTS.NEW_SNAPSHOT, () =>
      cb(this.snapshotSystem.getLatestOmniscientDiffSnapshot())
    );
  }

  subscribeForPlayer(
    id: string,
    cb: (snapshot: GameStateSnapshot<SnapshotDiff>) => void
  ) {
    this.on(GAME_EVENTS.NEW_SNAPSHOT, () =>
      cb(this.snapshotSystem.getLatestDiffSnapshotForPlayer(id))
    );
  }

  async emit<TEventName extends keyof GameEventMap & string>(
    eventName: TEventName,
    eventArg: GameEventMap[TEventName]
  ) {
    await this.emitter.emit(eventName, eventArg);
  }

  dispatch(input: SerializedInput) {
    if (this.gamePhaseSystem.getState() === GAME_PHASES.GAME_END) return;
    return this.inputSystem.dispatch(input);
  }

  shutdown() {
    this.emitter.removeAllListeners();
  }

  // clone(id: number) {
  //   const game = new Game({
  //     ...this.options,
  //     id: `simulation_${id}`,
  //     history: this.inputSystem.serialize()
  //   });
  //   game.initialize();

  //   return game;
  // }

  // simulateDispatch(playerId: string, input: SerializedInput) {
  //   const game = this.clone(++this.nextSimulationId);
  //   game.dispatch(input);
  //   game.snapshotSystem.takeSnapshot();

  //   return game.snapshotSystem.getLatestSnapshotForPlayer(playerId);
  // }
}
