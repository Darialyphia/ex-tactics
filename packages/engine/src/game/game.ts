import { defaultConfig, type Config } from '../config';
import { InputSystem, type SerializedInput } from '../input/input-system';
import { RngSystem } from '../rng/rng.system';
import { type BetterOmit, type Serializable } from '@game/shared';
import {
  GameSnapshotSystem,
  type GameStateSnapshot,
  type SnapshotDiff
} from './systems/game-snapshot.system';
import { GAME_EVENTS, GameReadyEvent, type GameEventMap } from './game.events';
import { modifierIdFactory } from '../modifier/modifier.entity';
import type { Player, PlayerOptions } from '../player/player.entity';
import { TypedSerializableEventEmitter } from '../utils/typed-emitter';
import { PlayerManager } from '../player/player.manager';

export type GameOptions = {
  id: string;
  rngSeed: string;
  history?: SerializedInput[];
  players: PlayerOptions[];
  overrides: Partial<{
    config: Partial<Config>;
    winCondition: (game: Game, player: Player) => boolean;
  }>;
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

  readonly rngSystem = new RngSystem();

  readonly inputSystem = new InputSystem(this);

  readonly snapshotSystem = new GameSnapshotSystem(this);

  readonly playerManager = new PlayerManager(this);

  readonly modifierIdFactory = modifierIdFactory();

  constructor(readonly options: GameOptions) {
    this.id = options.id;
    this.config = Object.assign({}, defaultConfig, options.overrides.config);
  }

  get winCondition() {
    return this.options.overrides.winCondition;
  }

  initialize() {
    const start = performance.now();
    // const now = start;

    this.rngSystem.initialize({ seed: this.options.rngSeed });

    this.playerManager.initialize({ players: this.options.players });

    this.snapshotSystem.initialize({ enabled: this.options.enableSnapshots ?? true });

    this.inputSystem.initialize();

    this.emit(GAME_EVENTS.READY, new GameReadyEvent({}));

    if (this.options.history) {
      this.inputSystem.applyHistory(this.options.history);
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

  emit<TEventName extends keyof GameEventMap & string>(
    eventName: TEventName,
    eventArg: GameEventMap[TEventName]
  ) {
    this.emitter.emit(eventName, eventArg);
  }

  dispatch(input: SerializedInput) {
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
