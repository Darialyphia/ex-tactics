<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { type Viewport } from 'pixi-viewport';
import { Container } from 'pixi.js';
import { until, useEventListener } from '@vueuse/core';
import { useIsoCamera } from '../composables/useIsoCamera';
import { config } from '@/utils/config';
import { useIsoWorld } from '../composables/useIsoWorld';

const app = useApplication();

const camera = useIsoCamera();
const { rows, columns, planes } = useIsoWorld();

const worldSize = computed(() => ({
  width: (columns.value + rows.value) * (config.TILE_SIZE.x * 0.5) + config.CAMERA.PADDING,
  height:
    (columns.value + rows.value) * (config.TILE_SIZE.y * 0.5) +
    config.TILE_SIZE.z * planes.value +
    config.CAMERA.PADDING
}));

until(camera.viewport)
  .toBeTruthy()
  .then(viewport => {
    viewport
      .drag({
        mouseButtons: 'left'
      })
      .pinch()
      .decelerate({ friction: 0.88 })
      .wheel({ smooth: 20, percent: 0.25 })
      .clamp({
        direction: 'all'
      })
      .clampZoom({ minScale: config.CAMERA.MIN_ZOOM, maxScale: config.CAMERA.MAX_ZOOM })
      .setZoom(config.CAMERA.INITIAL_ZOOM, false)
      // .mouseEdges({
      //   distance: 10,
      //   speed: 15,
      //   allowButtons: true
      // })
      .pinch({ noDrag: true })
      .moveCenter(worldSize.value.width / 2, worldSize.value.height / 2);
  });

useEventListener('resize', () => {
  setTimeout(() => {
    camera.viewport.value?.resize(window.innerWidth, window.innerHeight);
  }, 50);
});

watchEffect(() => {
  camera.offset.value = {
    x:
      config.TILE_SIZE.x * 0.5 +
      rows.value * (config.TILE_SIZE.x * 0.5) +
      config.CAMERA.PADDING * 0.5,
    y: planes.value * config.TILE_SIZE.z + config.CAMERA.PADDING * 0.5
  };
});
</script>

<template>
  <viewport
    :ref="
      (el: any) => {
        if (!el) return;

        camera.provideViewport(el);
      }
    "
    :screen-width="app.canvas.width"
    :screen-height="app.canvas.height"
    :world-width="worldSize.width"
    :world-height="worldSize.height"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
    :sortable-children="true"
  >
    <container :sortable-children="true" v-bind="camera.offset.value">
      <slot :worldSize="worldSize" />
    </container>
  </viewport>
</template>
