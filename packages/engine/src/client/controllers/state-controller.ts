import type { Override } from '@game/shared';
import type {
  EntityDictionary,
  SerializedEntity,
  SerializedOmniscientState,
  SerializedPlayerState,
  SnapshotDiff
} from '../../game/systems/game-snapshot.system';
import { ModifierViewModel } from '../view-models/modifier.model';
import { PlayerViewModel } from '../view-models/player.model';
import { match } from 'ts-pattern';
import type { GameClient, GameStateEntities } from '../client';
import { GAME_EVENTS, type SerializedStarEvent } from '../../game/game.events';
import { AbilityViewModel } from '../view-models/ability.model';
import { PassiveViewModel } from '../view-models/passive.model';
import { UnitViewModel } from '../view-models/unit.model';
import { ObstacleViewModel } from '../view-models/obstacle.model';
import { BoardCellViewModel } from '../view-models/board-cell.model';

export type GameClientState = Override<
  SerializedOmniscientState | SerializedPlayerState,
  {
    entities: GameStateEntities;
  }
>;

export class ClientStateController {
  state!: GameClientState;

  constructor(private client: GameClient) {}

  initialize(initialState: SerializedPlayerState | SerializedOmniscientState) {
    this.state = {
      ...initialState,
      entities: {}
    };
    this.state.entities = this.buildentities(initialState.entities);
  }

  private buildViewModel(entity: SerializedEntity) {
    const dict: GameClientState['entities'] = this.state?.entities ?? {};

    return match(entity)
      .with(
        { entityType: 'player' },
        entity => new PlayerViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'modifier' },
        entity => new ModifierViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'unit' },
        entity => new UnitViewModel(entity, dict, this.client)
      )
      .with({ entityType: 'obstacle' }, entity => {
        return new ObstacleViewModel(entity, dict, this.client);
      })
      .with({ entityType: 'passive' }, entity => {
        return new PassiveViewModel(entity, dict, this.client);
      })
      .with(
        { entityType: 'ability' },
        entity => new AbilityViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'board_cell' },
        entity => new BoardCellViewModel(entity, dict, this.client)
      )
      .exhaustive();
  }

  private buildentities = (entities: EntityDictionary): GameClientState['entities'] => {
    const dict: GameClientState['entities'] = this.state?.entities ?? {};
    for (const [id, entity] of Object.entries(entities)) {
      dict[id] = this.buildViewModel(entity);
    }
    return dict;
  };

  // prepopulate the state with new entities because they could be used by the fx events
  preupdate(newState: SnapshotDiff) {
    if (!this.state) return;

    for (const id of newState.addedEntities) {
      const entity = newState.entities[id];

      this.state.entities[id] = this.buildViewModel(entity as SerializedEntity);
    }
  }

  update(newState: SnapshotDiff): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { entities, config, addedEntities, removedEntities, ...rest } = newState;
    for (const [id, entity] of Object.entries(entities)) {
      if (this.state.entities[id]) {
        this.state.entities[id] = this.state.entities[id].update(entity as any).clone();
      } else {
        this.state.entities[id] = this.buildViewModel(entity as any);
      }
    }

    removedEntities.forEach(id => {
      delete this.state.entities[id];
    });

    this.state = {
      ...this.state,
      ...rest,
      config: { ...this.state.config, ...config }
    };
  }

  async onEvent(event: SerializedStarEvent, flush: () => Promise<void>) {}
}
