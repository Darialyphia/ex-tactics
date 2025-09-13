<script setup lang="ts">
import { config } from '@/utils/config';
import {
  useBoard,
  useGameState,
  useGameUi,
  useObstacles,
  useUnits
} from '../composables/useGameClient';
import type { IsoCameraContext } from '@/iso/composables/useIsoCamera';
import { until } from '@vueuse/core';
import IsoWorld from '@/iso/scenes/IsoWorld.vue';
import IsoCamera from '@/iso/scenes/IsoCamera.vue';
import Board from './board/Board.vue';
import Obstacle from './obstacle/Obstacle.vue';
import type { IsoWorldContext } from '@/iso/composables/useIsoWorld';
import Lights from '@/shared/scenes/Lights.vue';
import { provideLayers } from '@/shared/composables/useLayers';
import DeployedHeroes from './unit/DeployedHeroes.vue';
import { ROUND_PHASES } from '@game/engine/src/game/systems/turn.system';
import Unit from './unit/Unit.vue';

const board = useBoard();
const ui = useGameUi();
const obstacles = useObstacles();
const units = useUnits();
const state = useGameState();

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
      <Unit v-for="unit in units" :key="unit.id" :unit="unit" />
      <DeployedHeroes v-if="state.phase === ROUND_PHASES.DEPLOY" />
      <Lights />
    </IsoCamera>
  </IsoWorld>
</template>
