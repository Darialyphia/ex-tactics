import type { SerializedBoardCell } from '../../board/board-cell.entity';
import type { Config } from '../../config';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedUnit } from '../../unit/unit.entity';
import { areArraysIdentical } from '../../utils/utils';
import type { Game } from '../game';
import {
  GAME_EVENTS,
  GameNewSnapshotEvent,
  type GameEventName,
  type GameStarEvent,
  type SerializedStarEvent
} from '../game.events';
import type { AnyObject } from '@game/shared';

export type GameStateSnapshot<T> = {
  id: number;
  state: T;
  events: SerializedStarEvent[];
};

export type SerializedEntity = SerializedPlayer | SerializedBoardCell | SerializedUnit;

export type EntityDictionary = Record<string, SerializedEntity>;

export type EntityDiffDictionary = Record<string, Partial<SerializedEntity>>;

export type SerializedOmniscientState = {
  config: Config;
  entities: EntityDictionary;
};

export type SnapshotDiff = {
  config: Partial<Config>;
  entities: EntityDiffDictionary;
  addedEntities: string[];
  removedEntities: string[];
};

export type SerializedPlayerState = SerializedOmniscientState;

export class GameSnapshotSystem {
  private isEnabled = true;

  private playerCaches: Record<string, GameStateSnapshot<SerializedPlayerState>[]> = {
    omniscient: []
  };
  private omniscientCache: GameStateSnapshot<SerializedOmniscientState>[] = [];

  private eventsSinceLastSnapshot: GameStarEvent[] = [];

  private nextId = 0;

  constructor(private game: Game) {}

  private getObjectDiff<T extends AnyObject>(obj: T, prevObj: T | undefined): Partial<T> {
    if (!prevObj) return { ...obj };
    const result: Partial<T> = {};
    for (const key in obj) {
      if (Array.isArray(obj[key]) && Array.isArray(prevObj[key])) {
        if (!areArraysIdentical(obj[key], prevObj[key])) {
          result[key] = obj[key];
        }
      } else if (obj[key] !== prevObj[key]) {
        result[key] = obj[key];
      }
    }
    for (const key in prevObj) {
      if (!(key in obj)) {
        result[key] = undefined;
      }
    }
    return result;
  }

  private diffSnapshots(
    state: SerializedOmniscientState,
    prevState: SerializedOmniscientState
  ): SnapshotDiff {
    const entities: EntityDiffDictionary = {};
    for (const [key, entity] of Object.entries(state.entities)) {
      const diff = this.getObjectDiff(entity, prevState.entities[key]);
      if (Object.keys(diff).length > 0) {
        entities[key] = diff;
      }
    }
    return {
      config: this.getObjectDiff(state.config, prevState.config),
      entities,
      removedEntities: Object.keys(prevState.entities).filter(
        key => !(key in state.entities)
      ),
      addedEntities: Object.keys(state.entities).filter(
        key => !(key in prevState.entities)
      )
    };
  }

  initialize({ enabled }: { enabled: boolean }): void {
    this.isEnabled = enabled;

    const ignoredEvents: GameEventName[] = [
      GAME_EVENTS.NEW_SNAPSHOT,
      GAME_EVENTS.FLUSHED,
      GAME_EVENTS.INPUT_START,
      GAME_EVENTS.INPUT_END
    ];
    this.game.playerManager.players.forEach(player => {
      this.playerCaches[player.id] = [];
    });

    this.game.on('*', event => {
      if (ignoredEvents.includes(event.data.eventName)) return;
      if (!this.isEnabled) return;
      this.eventsSinceLastSnapshot.push(event);
    });
  }

  shutdown() {}

  getOmniscientSnapshotAt(index: number): GameStateSnapshot<SerializedOmniscientState> {
    const snapshot = this.omniscientCache[index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  geSnapshotForPlayerAt(
    playerId: string,
    index: number
  ): GameStateSnapshot<SerializedPlayerState> {
    const snapshot = this.playerCaches[playerId][index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  getLatestOmniscientSnapshot(): GameStateSnapshot<SerializedOmniscientState> {
    return this.getOmniscientSnapshotAt(this.nextId - 1);
  }

  getLatestOmniscientDiffSnapshot(): GameStateSnapshot<SnapshotDiff> {
    const latestSnapshot = this.getLatestOmniscientSnapshot();
    if (this.nextId < 2) {
      return {
        ...latestSnapshot,
        state: {
          removedEntities: [],
          addedEntities: Object.keys(latestSnapshot.state.entities),
          ...latestSnapshot.state
        }
      };
    }
    const previousSnapshot = this.getOmniscientSnapshotAt(this.nextId - 2);

    return {
      ...latestSnapshot,
      state: this.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  getLatestSnapshotForPlayer(playerId: string): GameStateSnapshot<SerializedPlayerState> {
    return this.geSnapshotForPlayerAt(playerId, this.nextId - 1);
  }

  getLatestDiffSnapshotForPlayer(playerId: string): GameStateSnapshot<SnapshotDiff> {
    const latestSnapshot = this.getLatestSnapshotForPlayer(playerId);
    if (this.nextId < 2) {
      return {
        ...latestSnapshot,
        state: {
          removedEntities: [],
          addedEntities: Object.keys(latestSnapshot.state.entities),
          ...latestSnapshot.state
        }
      };
    }
    const previousSnapshot = this.getOmniscientSnapshotAt(this.nextId - 2);

    return {
      ...latestSnapshot,
      state: this.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  private buildEntityDictionary(): EntityDictionary {
    const entities: EntityDictionary = {};

    this.game.playerManager.players.forEach(player => {
      entities[player.id] = player.serialize();
    });

    return entities;
  }

  serializeOmniscientState(): SerializedOmniscientState {
    return {
      config: this.game.config,
      entities: this.buildEntityDictionary()
    };
  }

  serializePlayerState(playerId: string): SerializedPlayerState {
    const state = this.serializeOmniscientState();

    // @TODO Remove entities that the player shouldn't have access to in order to prevent cheating

    return state;
  }

  takeSnapshot() {
    if (!this.isEnabled) return;
    const events = this.eventsSinceLastSnapshot.map(event => event.serialize());
    const id = this.nextId++;

    this.game.playerManager.players.forEach(player => {
      this.playerCaches[player.id].push({
        id,
        events: events as any,
        state: this.serializePlayerState(player.id)
      });
    });

    this.omniscientCache.push({
      id,
      events: events as any,
      state: this.serializeOmniscientState()
    });

    this.eventsSinceLastSnapshot = [];
    void this.game.emit(GAME_EVENTS.NEW_SNAPSHOT, new GameNewSnapshotEvent({}));
  }
}
