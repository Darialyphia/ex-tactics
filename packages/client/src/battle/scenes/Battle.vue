<script setup lang="ts">
import { config } from '@/utils/config';
import { useBoard, useGameUi, useObstacles } from '../composables/useGameClient';
import type { IsoCameraContext } from '@/iso/composables/useIsoCamera';
import { until } from '@vueuse/core';
import IsoWorld from '@/iso/scenes/IsoWorld.vue';
import IsoCamera from '@/iso/scenes/IsoCamera.vue';
import Board from './board/Board.vue';
import Obstacle from './obstacle/Obstacle.vue';
import type { IsoWorldContext } from '@/iso/composables/useIsoWorld';
import Lights from '@/shared/scenes/Lights.vue';
import { provideLayers } from '@/shared/composables/useLayers';
import HeroToDeploy from './unit/HeroToDeploy.vue';
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';

const board = useBoard();
const ui = useGameUi();
const obstacles = useObstacles();

const planes = computed(() => {
  return Math.max(...board.value.cells.map(cell => cell.position.z)) + 1;
});

const world = ref<{ camera: IsoCameraContext; grid: IsoWorldContext } | null>(null);

until(() => world.value?.camera)
  .toBeTruthy()
  .then(camera => {
    ui.value.camera = {
      rotateCW: () => camera.rotateCW(),
      rotateCCW: () => camera.rotateCCW(),
      getZoom: () => camera.getZoom()
    };
  });

provideLayers();
</script>

<template>
  <IsoWorld
    ref="world"
    :angle="0"
    :tile-size="config.TILE_SIZE"
    :columns="board.cols"
    :rows="board.rows"
    :planes="planes"
  >
    <IsoCamera>
      <Board />

      <Obstacle v-for="obstacle in obstacles" :key="obstacle.id" :obstacle="obstacle" />
      <AnimatedIsoPoint
        v-for="hero in ui.deployment"
        :key="hero.hero.blueprintId"
        :position="hero.position"
        :z-index-offset="50"
      >
        <HeroToDeploy :hero="hero.hero" />
      </AnimatedIsoPoint>
      <Lights />
    </IsoCamera>
  </IsoWorld>
</template>
