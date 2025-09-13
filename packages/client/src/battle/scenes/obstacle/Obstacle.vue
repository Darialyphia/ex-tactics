<script setup lang="ts">
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import type { ObstacleViewModel } from '@game/engine/src/client/view-models/obstacle.model';
import ObstacleSprite from './ObstacleSprite.vue';
import ObstacleShadow from './ObstacleShadow.vue';
import { Container } from 'pixi.js';
import { until } from '@vueuse/core';
import { useLights } from '@/shared/composables/useLightsManager';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { getScaleXForOrientation } from '@/utils/sprite';

const { obstacle } = defineProps<{
  obstacle: ObstacleViewModel;
}>();

const lights = useLights();

const isoRef = ref<{ container: Container }>();
until(isoRef)
  .toBeTruthy()
  .then(iso => {
    lights.addLightSource(obstacle.id, iso.container);
  });

const camera = useIsoCamera();
const scaleX = computed(() => getScaleXForOrientation(obstacle.orientation, camera.angle.value));
</script>

<template>
  <AnimatedIsoPoint :position="obstacle.position" :z-index-offset="50" ref="isoRef">
    <container :scale-x="scaleX">
      <ObstacleShadow :obstacle="obstacle" />
      <ObstacleSprite :obstacle="obstacle" />
    </container>
  </AnimatedIsoPoint>
</template>
