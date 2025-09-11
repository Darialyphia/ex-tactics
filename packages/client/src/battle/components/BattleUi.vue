<script setup lang="ts">
import { useGameState, useGameUi } from '../composables/useGameClient';

const state = useGameState();

const ui = useGameUi();
</script>

<template>
  <header class="text-center">
    phase: {{ state.phase }}

    <div>
      CAMERA
      <button
        @click="
          () => {
            console.log('rotate cw');
            ui.camera?.rotateCW();
          }
        "
      >
        Rotate CW
      </button>
      <button @click="ui.camera?.rotateCCW()">Rotate CCW</button>
    </div>
    <div>
      DEBUG
      <button
        @click="
          () => {
            console.log(state);
          }
        "
      >
        Debug Game State
      </button>
    </div>
  </header>
</template>

<style lang="postcss" scoped>
button {
  background-color: var(--gray-10);
  color: white;
  padding: var(--size-3);
  border-radius: var(--radius-2);
  margin: var(--size-2);
  cursor: pointer;
}
</style>
