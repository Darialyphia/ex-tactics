import type { EmptyObject, MaybePromise, Values } from '@game/shared';
import type { InputDispatcher } from '../input/input-system';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState,
  SnapshotDiff
} from '../game/systems/game-snapshot.system';
import { FxController } from './controllers/fx-controller';
import {
  ClientStateController,
  type GameClientState
} from './controllers/state-controller';
import { UiController } from './controllers/ui-controller';
import { AsyncTypedEventEmitter } from '../utils/async-emitter';
import type { AbilityViewModel } from './view-models/ability.model';
import type { ModifierViewModel } from './view-models/modifier.model';
import type { ObstacleViewModel } from './view-models/obstacle.model';
import type { PassiveViewModel } from './view-models/passive.model';
import type { PlayerViewModel } from './view-models/player.model';
import type { UnitViewModel } from './view-models/unit.model';
import type { BoardCellViewModel } from './view-models/board-cell.model';

export const GAME_TYPES = {
  LOCAL: 'local',
  ONLINE: 'online'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type OnSnapshotUpdateCallback = (
  snapshot: GameStateSnapshot<SnapshotDiff>
) => MaybePromise<void>;

export type NetworkAdapter = {
  dispatch: InputDispatcher;
  subscribe(cb: OnSnapshotUpdateCallback): void;
  sync: (lastSnapshotId: number) => Promise<Array<GameStateSnapshot<SnapshotDiff>>>;
};

export type GameClientOptions = {
  networkAdapter: NetworkAdapter;
  gameType: GameType;
  playerId: string;
};

export type GameStateEntities = Record<
  string,
  | AbilityViewModel
  | PlayerViewModel
  | UnitViewModel
  | ModifierViewModel
  | PassiveViewModel
  | ObstacleViewModel
  | BoardCellViewModel
>;

export class GameClient {
  readonly fx = new FxController();

  readonly stateManager: ClientStateController;

  readonly ui: UiController;

  readonly networkAdapter: NetworkAdapter;

  readonly gameType: GameType;

  private initialState!: SerializedOmniscientState | SerializedPlayerState;

  playerId: string;

  private lastSnapshotId = -1;

  private snapshots = new Map<number, GameStateSnapshot<SnapshotDiff>>();

  private _isPlayingFx = false;

  public isReady = false;

  private _processingUpdate = false;

  private queue: Array<GameStateSnapshot<SnapshotDiff>> = [];

  private emitter = new AsyncTypedEventEmitter<{
    update: EmptyObject;
    updateCompleted: GameStateSnapshot<SnapshotDiff>;
  }>('sequential');

  constructor(options: GameClientOptions) {
    this.networkAdapter = options.networkAdapter;
    this.stateManager = new ClientStateController(this);
    this.ui = new UiController(this);
    this.gameType = options.gameType;
    this.playerId = options.playerId;

    this.networkAdapter.subscribe(async snapshot => {
      console.groupCollapsed(`Snapshot Update: ${snapshot.id}`);
      console.log('state', snapshot.state);
      console.log('events', snapshot.events);
      console.groupEnd();
      this.queue.push(snapshot);
      if (this._processingUpdate) return;
      await this.processQueue();
    });
  }

  get nextSnapshotId() {
    return this.lastSnapshotId + 1;
  }

  get isPlayingFx() {
    return this._isPlayingFx;
  }

  get state() {
    return this.stateManager.state;
  }

  private async processQueue() {
    if (!this.isReady) {
      console.warn('Waiting for game client to be ready to process queue...');
      return;
    }
    if (this._processingUpdate || this.queue.length === 0) {
      console.warn('Already processing updates or queue is empty, skipping processing.');
      return;
    }

    this._processingUpdate = true;

    while (this.queue.length > 0) {
      const snapshot = this.queue.shift();
      await this.update(snapshot!);
    }

    this._processingUpdate = false;
  }

  getActivePlayerId() {
    const activeUnit = this.stateManager.state.entities[
      this.stateManager.state.activeUnitId
    ]! as UnitViewModel;
    return activeUnit.player.id;
  }

  initialize(
    snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
  ) {
    this.lastSnapshotId = snapshot.id;
    this.initialState = snapshot.state;

    this.stateManager.initialize(snapshot.state);

    if (this.gameType === GAME_TYPES.LOCAL) {
      this.playerId = this.getActivePlayerId();
    }

    this.isReady = true;
    if (this.queue.length > 0) {
      void this.processQueue();
    }
  }

  async onInvalidSnapshot() {
    this.queue = [];
    await this.sync();
  }
  async update(snapshot: GameStateSnapshot<SnapshotDiff>) {
    if (snapshot.id <= this.lastSnapshotId) {
      console.log(
        `Stale snapshot, latest is ${this.lastSnapshotId}, received is ${snapshot.id}. skipping`
      );
      return;
    }

    if (snapshot.id > this.nextSnapshotId) {
      console.warn(
        `Missing snapshots, latest is ${this.lastSnapshotId}, received is ${snapshot.id}`
      );
      return await this.onInvalidSnapshot();
    }

    this.lastSnapshotId = snapshot.id;

    try {
      this._isPlayingFx = true;
      this.stateManager.preupdate(snapshot.state);
      for (const event of snapshot.events) {
        await this.stateManager.onEvent(event, async () => {
          await this.emitter.emit('update', {});
        });

        await this.fx.emit(event.eventName, event.event);
      }
      this._isPlayingFx = false;

      this.stateManager.update(snapshot.state);

      if (this.gameType === GAME_TYPES.LOCAL) {
        this.playerId = this.getActivePlayerId();
      }

      this.ui.update();
      this.snapshots.set(snapshot.id, snapshot);
      await this.emitter.emit('update', {});
      await this.emitter.emit('updateCompleted', snapshot);
    } catch (err) {
      console.error(err);
    }
  }

  onUpdate(cb: () => void) {
    this.emitter.on('update', cb);
    return () => this.emitter.off('update', cb);
  }

  onUpdateCompleted(cb: (snapshot: GameStateSnapshot<SnapshotDiff>) => void) {
    this.emitter.on('updateCompleted', cb);
    return () => this.emitter.off('updateCompleted', cb);
  }

  waitUntil(predicate: (state: GameClientState) => boolean) {
    return new Promise<void>(resolve => {
      const check = () => {
        if (predicate(this.state)) {
          resolve();
          this.emitter.off('updateCompleted', check);
        }
      };
      check();
      this.emitter.on('updateCompleted', check);
    });
  }

  private async sync() {
    const snapshots = await this.networkAdapter.sync(this.lastSnapshotId);
    this.queue.push(...snapshots);
  }
}
