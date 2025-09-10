<script lang="ts" setup>
import IsoWorld from '@/iso/scenes/IsoWorld.vue';
import IsoCamera from '@/iso/scenes/IsoCamera.vue';
import { testMap } from '@game/engine/src/board/maps/test-map';
import { indexToPoint } from '@game/shared';
import { config } from '@/utils/config';
import IsoPoint from '@/iso/scenes/IsoPoint.vue';
import { useAssets } from '@/shared/composables/useAssets';

definePage({
  name: 'Home',
  path: '/'
});

const cells = testMap.cells.map((cell, index) => ({
  ...cell,
  position: indexToPoint(index, testMap.cols, testMap.rows)
}));
const planes = Math.max(...cells.map(c => c.position.z)) + 1;

const assets = useAssets();

const textureNames = new Set(cells.map(cell => `tile-${cell.tile}`));
const ready = ref(false);

const load = async () => {
  if (ready.value) return;
  await Promise.all([...textureNames].map(tex => assets.load(tex)));

  ready.value = true;
};

load();
</script>

<template>
  <container v-if="ready">
    <IsoWorld
      :angle="0"
      :tile-size="config.TILE_SIZE"
      :columns="testMap.cols"
      :rows="testMap.rows"
      :planes="planes"
    >
      <IsoCamera>
        <IsoPoint
          v-for="(cell, index) in cells"
          :key="index"
          :position="cell.position"
          :tile-size="config.TILE_SIZE"
        >
          <sprite :texture="`tile-${cell.tile}`" />
        </IsoPoint>
      </IsoCamera>
    </IsoWorld>
  </container>
</template>
