<script lang="ts" setup>
import IsoWorld from '@/iso/scenes/IsoWorld.vue';
import IsoCamera from '@/iso/scenes/IsoCamera.vue';
import { type Point3D } from '@game/shared';
import { config } from '@/utils/config';
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import { useAssets } from '@/shared/composables/useAssets';
import { rotateCartesian } from '@/iso/composables/useIso';
import type { IsoCameraContext } from '@/iso/composables/useIsoCamera';
import { useGameClientStore } from '@/battle/composables/useGameClient';
import { until } from '@vueuse/core';
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';

definePage({
  name: 'Home',
  path: '/'
});

const gameClientStore = useGameClientStore();
const assets = useAssets();
const ready = ref(false);

const client = computed(() => gameClientStore.client);
until(client)
  .toBeTruthy()
  .then(async client => {
    const textureNames = new Set(
      client.state.board.cells.map(cell => {
        const entity = client.state.entities[cell] as BoardCellViewModel;
        return entity.spriteId;
      })
    );
    await Promise.all([...textureNames].map(tex => assets.load(tex)));

    ready.value = true;
  });

const world = ref<{ camera: IsoCameraContext } | null>(null);
const angle = computed(() => {
  // @ts-expect-error wrong types
  return world.value?.camera.angle.value || 0;
});

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

const displayedCells = computed(() => {
  if (!client.value) return [];
  const cellMap = new Map<string, BoardCellViewModel>();
  const getKey = (cell: Point3D) => `${cell.x}-${cell.y}-${cell.z}`;

  cells.value.forEach(cell => {
    cellMap.set(getKey(cell.position), cell);
  });
  return cells.value.filter(cell => {
    const rotated = rotateCartesian(
      cell.position,
      { columns: client.value!.state.board.cols, rows: client.value!.state.board.rows },
      angle.value
    );

    const result = !(
      cellMap.get(getKey({ x: rotated.x + 1, y: rotated.y, z: rotated.z })) &&
      cellMap.get(getKey({ x: rotated.x, y: rotated.y + 1, z: rotated.z })) &&
      cellMap.get(getKey({ x: rotated.x - 1, y: rotated.y + 1, z: rotated.z })) &&
      cellMap.get(getKey({ x: rotated.x, y: rotated.y - 1, z: rotated.z })) &&
      cellMap.get(getKey({ x: cell.position.x, y: cell.position.y, z: cell.position.z + 1 }))
    );

    return result;
  });
});

const uiRoot = document.getElementById('#app');
</script>

<template>
  <container v-if="client && ready">
    <IsoWorld
      ref="world"
      :angle="0"
      :tile-size="config.TILE_SIZE"
      :columns="client.state.board.cols"
      :rows="client.state.board.rows"
      :planes="planes"
    >
      <IsoCamera>
        <AnimatedIsoPoint
          v-for="(cell, index) in displayedCells"
          :key="index"
          :position="cell.position"
          :tile-size="config.TILE_SIZE"
        >
          <sprite :texture="cell.spriteId" />
        </AnimatedIsoPoint>
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
