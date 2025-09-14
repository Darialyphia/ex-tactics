import { GameClient, type GameClientOptions } from '@game/engine/src/client/client';
import type { FXEvent, FXEventMap } from '@game/engine/src/client/controllers/fx-controller';
import { isDefined, type BetterOmit, type Nullable } from '@game/shared';
import { gameStateRef } from './gameStateRef';
import { defineStore } from 'pinia';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState
} from '@game/engine/src/game/systems/game-snapshot.system';
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import type { ObstacleViewModel } from '@game/engine/src/client/view-models/obstacle.model';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';

export const useGameClientStore = defineStore('battle', () => {
  const client = ref<GameClient | null>(null);
  const forceUpdate = () => {
    triggerRef(client);
  };
  return {
    client,
    init(
      options: BetterOmit<GameClientOptions, 'forceSync'>,
      snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
    ) {
      client.value = new GameClient({ ...options, forceSync: forceUpdate });
      client.value.initialize(snapshot);
      // @ts-expect-error export the client for debugging
      window.__debugClient = () => {
        console.log(client.value);
      };
    }
  };
});

export const useGameClient = () => {
  const { client } = useGameClientStore();

  return client!;
};

export const useGameState = () => {
  return gameStateRef(state => ({ ...state }));
};

export const useGameUi = () => {
  const client = useGameClient();

  const ui = computed(() => client.ui);

  const cleanup = client.onUiSync(() => {
    triggerRef(ui);
  });

  onUnmounted(cleanup);

  return ui;
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
  return gameStateRef(state => ({
    cols: state.board.cols,
    rows: state.board.rows,
    cells: state.board.cells.map(cellId => {
      return state.entities[cellId] as BoardCellViewModel;
    })
  }));
};

export const useObstacles = () => {
  return gameStateRef(state => {
    return state.obstacles.map(obstacleId => {
      return state.entities[obstacleId] as ObstacleViewModel;
    });
  });
};

export const useUnits = () => {
  return gameStateRef(state => {
    return state.units.map(unitId => {
      return state.entities[unitId] as UnitViewModel;
    });
  });
};

export const usePlayers = () => {
  return gameStateRef(state => {
    return state.players.map(playerId => {
      return state.entities[playerId] as PlayerViewModel;
    });
  });
};

export const useMyPlayer = () => {
  const client = useGameClient();
  return gameStateRef(state => {
    return state.entities[client.playerId] as PlayerViewModel;
  });
};

export const useActiveUnit = () => {
  return gameStateRef(state => {
    if (!state.activeUnitId) return null;

    return state.entities[state.activeUnitId] as UnitViewModel;
  });
};

export const useClientPlayerId = () => {
  const client = useGameClient();
  return gameStateRef(() => client.playerId);
};
