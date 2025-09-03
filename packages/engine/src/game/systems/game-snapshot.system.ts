import { System } from '../../system';
import type { Config } from '../../config';
import {
  GAME_EVENTS,
  GameNewSnapshotEvent,
  type GameEventName,
  type GameStarEvent,
  type SerializedStarEvent
} from '../game.events';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedMinionCard } from '../../card/entities/minion.entity';
import type { SerializedHeroCard } from '../../card/entities/hero.entity';
import type { SerializedSpellCard } from '../../card/entities/spell.entity';
import type { SerializedArtifactCard } from '../../card/entities/artifact.entity';
import type { SerializedGamePhaseContext } from './game-phase.system';
import type { SerializedInteractionContext } from './game-interaction.system';
import type { SerializedBoard } from '../../board/board-side.entity';
import type { CardBeforePlayEvent, CardDiscardEvent } from '../../card/card.events';
import type { SerializedEffectChain } from '../effect-chain';
import type { AnyObject } from '@game/shared';
import { areArraysIdentical } from '../../utils/utils';
import type { SerializedAbility } from '../../card/card-blueprint';
import type { Ability, AbilityOwner } from '../../card/entities/ability.entity';

export type GameStateSnapshot<T> = {
  id: number;
  state: T;
  events: SerializedStarEvent[];
};

export type EntityDictionary = Record<
  string,
  | SerializedMinionCard
  | SerializedHeroCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedPlayer
  | SerializedModifier
  | SerializedAbility
>;

export type EntityDiffDictionary = Record<
  string,
  | Partial<SerializedMinionCard>
  | Partial<SerializedSpellCard>
  | Partial<SerializedArtifactCard>
  | Partial<SerializedPlayer>
  | Partial<SerializedModifier>
  | Partial<SerializedAbility>
>;

export type SerializedOmniscientState = {
  config: Config;
  entities: EntityDictionary;
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  players: string[];
  board: SerializedBoard;
  currentPlayer: string;
  turnCount: number;
  effectChain: SerializedEffectChain | null;
};

export type SnapshotDiff = {
  config: Partial<Config>;
  entities: EntityDiffDictionary;
  addedEntities: string[];
  removedEntities: string[];
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  board: SerializedBoard;
  turnCount: number;
  currentPlayer: string;
  players: string[];
  effectChain: SerializedEffectChain | null;
};

export type SerializedPlayerState = SerializedOmniscientState;

export class GameSnapshotSystem extends System<{ enabled: boolean }> {
  private isEnabled = true;

  private playerCaches: Record<string, GameStateSnapshot<SerializedPlayerState>[]> = {
    omniscient: []
  };
  private omniscientCache: GameStateSnapshot<SerializedOmniscientState>[] = [];

  private eventsSinceLastSnapshot: GameStarEvent[] = [];

  private nextId = 0;

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
      ),
      phase: state.phase,
      interaction: state.interaction,
      board: state.board,
      turnCount: state.turnCount - prevState.turnCount,
      currentPlayer: state.currentPlayer,
      players: state.players,
      effectChain: state.effectChain
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
    this.playerCaches[this.game.playerSystem.player1.id] = [];
    this.playerCaches[this.game.playerSystem.player2.id] = [];

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
    this.game.cardSystem.cards.forEach(card => {
      entities[card.id] = card.serialize();
      card.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
      if ('abilities' in card) {
        (card.abilities as Ability<AbilityOwner>[]).forEach(ability => {
          entities[ability.id] = ability.serialize();
        });
      }
    });
    this.game.playerSystem.players.forEach(player => {
      entities[player.id] = player.serialize();
      player.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });
    return entities;
  }

  serializeOmniscientState(): SerializedOmniscientState {
    return {
      config: this.game.config,
      entities: this.buildEntityDictionary(),
      phase: this.game.gamePhaseSystem.serialize(),
      interaction: this.game.interaction.serialize(),
      board: this.game.boardSystem.serialize(),
      players: this.game.playerSystem.players.map(player => player.id),
      currentPlayer: this.game.gamePhaseSystem.currentPlayer.id,
      turnCount: this.game.gamePhaseSystem.elapsedTurns,
      effectChain: this.game.effectChainSystem.serialize()
    };
  }

  serializePlayerState(playerId: string): SerializedPlayerState {
    const state = this.serializeOmniscientState();

    // Remove entities that the player shouldn't have access to in order to prevent cheating
    const opponent = this.game.playerSystem.getPlayerById(playerId)!.opponent;

    const hasBeenPlayed = (cardId: string) => {
      return this.eventsSinceLastSnapshot.some(e => {
        const event = e.data.event;
        if (
          e.data.eventName === GAME_EVENTS.CARD_BEFORE_PLAY &&
          (event as CardBeforePlayEvent).data.card.id === cardId
        ) {
          return true;
        }
        if (
          e.data.eventName === GAME_EVENTS.CARD_DISCARD &&
          (event as CardDiscardEvent).data.card.id === cardId
        ) {
          return true;
        }

        return false;
      });
    };
    opponent.cardManager.mainDeck.cards.forEach(card => {
      if (hasBeenPlayed(card.id)) return;

      delete state.entities[card.id];
    });

    opponent.cardManager.hand.forEach(card => {
      if (hasBeenPlayed(card.id)) return;

      delete state.entities[card.id];
    });

    return state;
  }

  takeSnapshot() {
    if (!this.isEnabled) return;
    const events = this.eventsSinceLastSnapshot.map(event => event.serialize());
    const id = this.nextId++;
    this.playerCaches[this.game.playerSystem.player1.id].push({
      id,
      events: events as any,
      state: this.serializePlayerState(this.game.playerSystem.player1.id)
    });

    this.playerCaches[this.game.playerSystem.player2.id].push({
      id,
      events: events as any,
      state: this.serializePlayerState(this.game.playerSystem.player2.id)
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
