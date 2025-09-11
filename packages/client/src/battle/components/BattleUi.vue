<script setup lang="ts">
import { useGameState, useGameUi } from '../composables/useGameClient';

const state = useGameState();

const ui = useGameUi();
</script>

<template>
  <header class="text-center">
    {{ state.phase }}

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
  </header>
</template>

<style lang="postcss" scoped></style>
