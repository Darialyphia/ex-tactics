import type { GameClientState } from '@game/engine/src/client/controllers/state-controller';
import { useGameClient } from './useGameClient';

/**
 * Creates a reactive reference to a specific part of the game state.
 * It ensures that the reference updates whenever a new game snapshot is received
 */
export const gameStateRef = <T>(selector: (state: GameClientState) => T) => {
  const client = useGameClient();

  const value = ref(selector(client.state)) as Ref<T>;

  watchEffect(() => {
    value.value = selector(client.state);
  });
  const unsub = client.onUpdateCompleted(() => {
    value.value = selector(client.state);
  });

  onUnmounted(() => unsub());

  return value;
};
