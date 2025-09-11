import type { SerializedBoardCell } from '../../board/board-cell.entity';
import type { Config } from '../../config';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedObstacle } from '../../obstacle/obstacle.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedAbility } from '../../unit/ability/ability.entity';
import type { SerializedPassive } from '../../unit/passive/passive.entity';
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
import type { AnyObject, BetterExtract } from '@game/shared';
import type { TurnPhase } from './turn.system';

export type GameStateSnapshot<T> = {
  id: number;
  state: T;
  events: SerializedStarEvent[];
};

export type SerializedEntity =
  | SerializedPlayer
  | SerializedBoardCell
  | SerializedUnit
  | SerializedAbility
  | SerializedPassive
  | SerializedObstacle
  | SerializedModifier;

export type EntityDictionary = Record<string, SerializedEntity>;

export type EntityDiffDictionary = Record<string, Partial<SerializedEntity>>;

export type SerializedOmniscientState = {
  config: Config;
  entities: EntityDictionary;
  turnOrder: string[];
  activeUnitId: string | null;
  phase: TurnPhase;
  players: string[];
  board: {
    cols: number;
    rows: number;
    cells: string[];
  };
  obstacles: string[];
  units: string[];
};

export type SnapshotDiff = {
  config: Partial<Config>;
  entities: EntityDiffDictionary;
  addedEntities: string[];
  removedEntities: string[];
  activeUnitId: string | null;
  turnOrder: string[];
  phase: TurnPhase;
  obstacles: string[];
  units: string[];
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
      activeUnitId: state.activeUnitId ?? null,
      turnOrder: state.turnOrder,
      phase: state.phase,
      obstacles: state.obstacles,
      units: state.units,
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

    this.game.unitManager.units.forEach(unit => {
      entities[unit.id] = unit.serialize();
      unit.abilities.forEach(ability => {
        entities[ability.id] = ability.serialize();
      });
      unit.passives.forEach(passive => {
        entities[passive.id] = passive.serialize();
      });
      unit.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });

    this.game.obstacleManager.obstacles.forEach(obstacle => {
      entities[obstacle.id] = obstacle.serialize();
      obstacle.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });

    this.game.board.cells.forEach(cell => {
      entities[cell.id] = cell.serialize();
      cell.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });

    return entities;
  }

  serializeOmniscientState(): SerializedOmniscientState {
    return {
      config: this.game.config,
      entities: this.buildEntityDictionary(),
      activeUnitId: this.game.turnSystem.activeUnit?.id,
      turnOrder: this.game.turnSystem.serialize(),
      phase: this.game.turnSystem.phase,
      players: this.game.playerManager.players.map(p => p.id),
      obstacles: this.game.obstacleManager.obstacles.map(o => o.id),
      units: this.game.unitManager.units.map(u => u.id),
      board: {
        cols: this.game.board.cols,
        rows: this.game.board.rows,
        cells: this.game.board.cells.map(c => c.id)
      }
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
    this.game.emit(GAME_EVENTS.NEW_SNAPSHOT, new GameNewSnapshotEvent({}));
  }
}
