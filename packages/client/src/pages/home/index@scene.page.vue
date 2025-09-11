<script lang="ts" setup>
import { useGameClientStore } from '@/battle/composables/useGameClient';
import Battle from '@/battle/scenes/Battle.vue';

definePage({
  name: 'Home',
  path: '/'
});

const gameClientStore = useGameClientStore();
</script>

<template>
  <container v-if="gameClientStore.client">
    <Battle />
  </container>
</template>

<style lang="postcss">
#camera-controls {
  position: fixed;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}
</style>
