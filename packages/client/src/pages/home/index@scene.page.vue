<script lang="ts" setup>
import IsoWorld from '@/iso/scenes/IsoWorld.vue';
import IsoCamera from '@/iso/scenes/IsoCamera.vue';
import { config } from '@/utils/config';
import type { IsoCameraContext } from '@/iso/composables/useIsoCamera';
import { useGameClientStore } from '@/battle/composables/useGameClient';
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import Board from '@/battle/scenes/board/Board.vue';

definePage({
  name: 'Home',
  path: '/'
});

const gameClientStore = useGameClientStore();

const client = computed(() => gameClientStore.client);

const world = ref<{ camera: IsoCameraContext } | null>(null);

const cells = computed(() => {
  if (!client.value) return [];
  return client.value.state.board.cells.map(cellId => {
    return client.value?.state.entities[cellId] as BoardCellViewModel;
  });
});
const planes = computed(() => {
  if (!client.value) return 1;
  return Math.max(...cells.value.map(cell => cell.position.z)) + 1;
});

const uiRoot = document.getElementById('#app');
</script>

<template>
  <container v-if="client">
    <IsoWorld
      ref="world"
      :angle="0"
      :tile-size="config.TILE_SIZE"
      :columns="client.state.board.cols"
      :rows="client.state.board.rows"
      :planes="planes"
    >
      <IsoCamera>
        <Board />
      </IsoCamera>
    </IsoWorld>

    <External :root="uiRoot!" id="camera-controls">
      <button @click="world?.camera.rotateCW()">Rotate CW</button>
      <button @click="world?.camera.rotateCCW()">Rotate CCW</button>
    </External>
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
