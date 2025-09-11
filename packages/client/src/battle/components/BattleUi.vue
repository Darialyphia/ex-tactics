<script setup lang="ts">
import { useGameClient, useGameState, useGameUi, usePlayers } from '../composables/useGameClient';
import FPS from '@/shared/components/FPS.vue';

const state = useGameState();

const ui = useGameUi();

const players = usePlayers();

const client = useGameClient();
</script>

<template>
  <header class="text-center">
    phase: {{ state.phase }}

    <div>
      CAMERA
      <button @click="ui.camera?.rotateCW()">Rotate CW</button>
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
      <button
        v-for="player in players"
        :key="player.id"
        :class="{ active: client.playerId === player.id }"
        @click="client.playerId = player.id"
      >
        Player {{ player.name }} view
      </button>
    </div>
  </header>
  <FPS />
</template>

<style lang="postcss" scoped>
button {
  background-color: var(--gray-10);
  color: white;
  padding: var(--size-2);
  border-radius: var(--radius-2);
  margin: var(--size-2);
  cursor: pointer;

  &.active {
    outline: solid var(--border-size-2) var(--yellow-6);
  }
}
</style>
