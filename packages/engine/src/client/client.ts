import type { EmptyObject, MaybePromise, Values } from '@game/shared';
import type { InputDispatcher } from '../input/input-system';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState,
  SnapshotDiff
} from '../game/systems/game-snapshot.system';
import { ModifierViewModel } from './view-models/modifier.model';
import { CardViewModel } from './view-models/card.model';
import { PlayerViewModel } from './view-models/player.model';
import { FxController } from './controllers/fx-controller';
import {
  ClientStateController,
  type GameClientState
} from './controllers/state-controller';
import { UiController } from './controllers/ui-controller';
import { TypedEventEmitter } from '../utils/typed-emitter';
import { GAME_PHASES } from '../game/game.enums';
import { COMBAT_STEPS } from '../game/phases/combat.phase';
import { INTERACTION_STATES } from '../game/systems/game-interaction.system';
import type { Affinity } from '../card/card.enums';
import type { AbilityViewModel } from './view-models/ability.model';

export const GAME_TYPES = {
  LOCAL: 'local',
  ONLINE: 'online'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type GameStateEntities = Record<
  string,
  PlayerViewModel | CardViewModel | ModifierViewModel | AbilityViewModel
>;

export type OnSnapshotUpdateCallback = (
  snapshot: GameStateSnapshot<SnapshotDiff>
) => MaybePromise<void>;

export type NetworkAdapter = {
  dispatch: InputDispatcher;
  subscribe(cb: OnSnapshotUpdateCallback): void;
  sync: (lastSnapshotId: number) => Promise<Array<GameStateSnapshot<SnapshotDiff>>>;
};

export type FxAdapter = {
  onDeclarePlayCard: (card: CardViewModel, client: GameClient) => MaybePromise<void>;
  onCancelPlayCard: (card: CardViewModel, client: GameClient) => MaybePromise<void>;
  onSelectCardForManaCost: (
    card: CardViewModel,
    client: GameClient
  ) => MaybePromise<void>;
  onUnselectCardForManaCost: (
    card: CardViewModel,
    client: GameClient
  ) => MaybePromise<void>;
};

export type GameClientOptions = {
  networkAdapter: NetworkAdapter;
  fxAdapter: FxAdapter;
  gameType: GameType;
  playerId: string;
};

export class GameClient {
  readonly fx = new FxController();

  readonly stateManager: ClientStateController;

  readonly ui: UiController;

  readonly networkAdapter: NetworkAdapter;

  readonly fxAdapter: FxAdapter;

  readonly gameType: GameType;

  private initialState!: SerializedOmniscientState | SerializedPlayerState;

  playerId: string;

  private lastSnapshotId = -1;

  private snapshots = new Map<number, GameStateSnapshot<SnapshotDiff>>();

  private _isPlayingFx = false;

  public isReady = false;

  private _processingUpdate = false;

  private queue: Array<GameStateSnapshot<SnapshotDiff>> = [];

  private emitter = new TypedEventEmitter<{
    update: EmptyObject;
    updateCompleted: GameStateSnapshot<SnapshotDiff>;
  }>('sequential');

  constructor(options: GameClientOptions) {
    this.networkAdapter = options.networkAdapter;
    this.fxAdapter = options.fxAdapter;
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

    this.cancelPlayCard = this.cancelPlayCard.bind(this);
    this.commitPlayCard = this.commitPlayCard.bind(this);
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

  getActivePlayerIdFromSnapshotState(snapshot: SnapshotDiff) {
    if (snapshot.effectChain) {
      return snapshot.effectChain.player;
    }

    if (
      snapshot.phase.state === GAME_PHASES.ATTACK &&
      snapshot.phase.ctx.step === COMBAT_STEPS.DECLARE_BLOCKER
    ) {
      return snapshot.players.find(id => id !== snapshot.currentPlayer)!;
    }

    return snapshot.interaction.ctx.player;
  }

  getActivePlayerId() {
    if (this.stateManager.state.effectChain) {
      return this.stateManager.state.effectChain.player;
    }

    if (
      this.stateManager.state.phase.state === GAME_PHASES.ATTACK &&
      this.stateManager.state.phase.ctx.step === COMBAT_STEPS.DECLARE_BLOCKER
    ) {
      return this.stateManager.state.players.find(
        id => id !== this.stateManager.state.currentPlayer
      )!;
    }

    return this.stateManager.state.interaction.ctx.player;
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
        if (this.gameType === GAME_TYPES.LOCAL) {
          this.playerId = this.getActivePlayerIdFromSnapshotState(snapshot.state);
        }
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

  cancelPlayCard() {
    if (this.state.interaction.state !== INTERACTION_STATES.PLAYING_CARD) return;

    this.networkAdapter.dispatch({
      type: 'cancelPlayCard',
      payload: { playerId: this.state.currentPlayer }
    });
    const playedCard = this.state.entities[
      this.state.interaction.ctx.card
    ] as CardViewModel;

    void this.fxAdapter.onCancelPlayCard(playedCard, this);
  }

  commitPlayCard() {
    this.networkAdapter.dispatch({
      type: 'commitPlayCard',
      payload: {
        playerId: this.playerId,
        manaCostIndices: this.ui.selectedManaCostIndices
      }
    });
  }

  commitUseAbility() {
    this.networkAdapter.dispatch({
      type: 'commitUseAbility',
      payload: {
        playerId: this.playerId,
        manaCostIndices: this.ui.selectedManaCostIndices
      }
    });
  }

  cancelUseAbility() {
    if (this.state.interaction.state !== INTERACTION_STATES.USING_ABILITY) return;

    this.networkAdapter.dispatch({
      type: 'cancelUseAbility',
      payload: { playerId: this.state.currentPlayer }
    });
  }

  commitMinionSlotSelection() {
    this.networkAdapter.dispatch({
      type: 'commitMinionSlotSelection',
      payload: {
        playerId: this.playerId
      }
    });
  }

  commitCardSelection() {
    this.networkAdapter.dispatch({
      type: 'commitCardSelection',
      payload: {
        playerId: this.playerId
      }
    });
  }

  skipBlock() {
    this.networkAdapter.dispatch({
      type: 'declareBlocker',
      payload: {
        blockerId: null,
        playerId: this.playerId
      }
    });
  }

  endTurn() {
    this.networkAdapter.dispatch({
      type: 'declareEndTurn',
      payload: {
        playerId: this.playerId
      }
    });
  }

  passChain() {
    this.networkAdapter.dispatch({
      type: 'passChain',
      payload: {
        playerId: this.playerId
      }
    });
  }

  chooseAffinity(affinity: Affinity) {
    this.networkAdapter.dispatch({
      type: 'chooseAffinity',
      payload: {
        playerId: this.playerId,
        affinity
      }
    });
  }

  chooseCards(indices: number[]) {
    this.networkAdapter.dispatch({
      type: 'chooseCards',
      payload: {
        playerId: this.playerId,
        indices
      }
    });
  }

  skipDestiny() {
    this.networkAdapter.dispatch({
      type: 'skipDestiny',
      payload: {
        playerId: this.playerId
      }
    });
  }
}
