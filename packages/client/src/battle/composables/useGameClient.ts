import { GameClient, type GameClientOptions } from '@game/engine/src/client/client';
import type { FXEvent, FXEventMap } from '@game/engine/src/client/controllers/fx-controller';
import { isDefined, type Nullable } from '@game/shared';
import { gameStateRef } from './gameStateRef';
import { defineStore } from 'pinia';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState
} from '@game/engine/src/game/systems/game-snapshot.system';
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import type { ObstacleViewModel } from '@game/engine/src/client/view-models/obstacle.model';

export const useGameClientStore = defineStore('battle', () => {
  const client = ref<GameClient | null>(null);

  return {
    client,
    init(
      options: GameClientOptions,
      snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
    ) {
      client.value = new GameClient(options);
      client.value.initialize(snapshot);
    }
  };
});

export const useGameClient = () => {
  const { client } = useGameClientStore();

  return client!;
};

export const useGameState = () => {
  const client = useGameClient();

  return computed(() => client.stateManager.state);
};

export const useGameUi = () => {
  const client = useGameClient();

  return computed(() => client.ui);
};

export const useEntity = <T>(entityId: MaybeRef<string>) => {
  return gameStateRef(state => {
    return state.entities[unref(entityId)] as T;
  });
};

export const useMaybeEntity = <T>(entityId: MaybeRef<Nullable<string>>) => {
  return gameStateRef(state => {
    const id = unref(entityId);
    if (!isDefined(id)) return null;

    return state.entities[id] as T;
  });
};

export const useEntities = <T>(entityIds: MaybeRef<string[]>) => {
  const state = useGameState();
  return computed(() => {
    const ids = unref(entityIds);
    return ids.map(id => {
      const entity = state.value.entities[id];
      if (!entity) {
        throw new Error(`Entity with ID ${id} not found in the game state.`);
      }
      return entity as unknown as T;
    });
  });
};

export const useFxEvent = <T extends FXEvent>(
  name: T,
  handler: (eventArg: FXEventMap[T]) => Promise<void>
) => {
  const client = useGameClient();

  const unsub = client.fx.on(name, handler);

  onUnmounted(unsub);

  return unsub;
};

export const useBoard = () => {
  const client = useGameClient();

  return computed(() => ({
    cols: client.state.board.cols,
    rows: client.state.board.rows,
    cells: client.state.board.cells.map(cellId => {
      return client.state.entities[cellId] as BoardCellViewModel;
    })
  }));
};

export const useObstacles = () => {
  const client = useGameClient();

  return computed(() => {
    return client.state.obstacles.map(obstacleId => {
      return client.state.entities[obstacleId] as ObstacleViewModel;
    });
  });
};
