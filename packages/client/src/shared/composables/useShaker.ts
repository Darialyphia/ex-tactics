import type { Container } from 'pixi.js';
import type { Ref } from 'vue';

export interface ShakeProps {
  isBidirectional: boolean;
  count: number;
  amount: number;
  delay: number;
}

export const useShaker = (container: Ref<Container | undefined>) => {
  const state = {
    isBidirectional: true,
    count: 10,
    amount: 6,
    delay: 25,
    isShaking: false,
    shakeCount: 0
  };

  const trigger = (shakeProps?: ShakeProps): void => {
    if (!container.value) return;
    const originalPos = { x: container.value.x, y: container.value.y };
    if (shakeProps) {
      state.count = shakeProps.count;
      state.amount = shakeProps.amount;
      state.delay = shakeProps.delay;
      state.isBidirectional = shakeProps.isBidirectional;
    }

    if (!state.isShaking) {
      state.isShaking = true;
      state.shakeCount = 0;
    }
    state.shakeCount++;
    if (state.shakeCount > state.count) {
      container.value.position.set(originalPos.x, originalPos.y);
      state.shakeCount = 0;
      state.isShaking = false;
    } else {
      container.value.position.x = Math.floor(Math.random() * state.amount) - state.amount / 2;
      if (state.isBidirectional) {
        container.value.position.y = Math.floor(Math.random() * state.amount) - state.amount / 2;
      }
      setTimeout(() => trigger(), state.delay);
    }
  };
  return { trigger };
};
