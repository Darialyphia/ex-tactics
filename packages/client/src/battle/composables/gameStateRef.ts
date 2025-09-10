import type { GameClientState } from '@game/engine/src/client/controllers/state-controller';
import { useGameClient, useGameState } from './useGameClient';

export const gameStateRef = <T>(selector: (state: GameClientState) => T) => {
  const state = useGameState();

  const value = computed(() => selector(state.value));

  const client = useGameClient();

  const unsub = client.onUpdateCompleted(() => {
    triggerRef(value);
  });

  onUnmounted(() => unsub());

  return value;
};
