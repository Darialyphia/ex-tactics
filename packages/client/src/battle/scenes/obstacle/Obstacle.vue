<script setup lang="ts">
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import type { ObstacleViewModel } from '@game/engine/src/client/view-models/obstacle.model';
import ObstacleSprite from './ObstacleSprite.vue';
import ObstacleShadow from './ObstacleShadow.vue';
import { useLightsManager } from '@/battle/composables/useLightsManager';
import { Container } from 'pixi.js';
import { until } from '@vueuse/core';

const { obstacle } = defineProps<{
  obstacle: ObstacleViewModel;
}>();

const lights = useLightsManager();

const isoRef = ref<{ container: Container }>();
until(isoRef)
  .toBeTruthy()
  .then(iso => {
    lights.addLightSource(obstacle.id, iso.container);
  });
</script>

<template>
  <AnimatedIsoPoint :position="obstacle.position" :z-index-offset="50" ref="isoRef">
    <!-- <sprite
      :texture="light"
      :anchor="{ x: 0.5, y: 0.6 }"
      :alpha="0.35"
      blend-mode="add"
      :tint="0xffe6aa"
      :scale-y="0.7"
    /> -->
    <ObstacleShadow :obstacle="obstacle" />
    <ObstacleSprite :obstacle="obstacle" />
  </AnimatedIsoPoint>
</template>
