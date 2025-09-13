<script setup lang="ts">
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import type { ObstacleViewModel } from '@game/engine/src/client/view-models/obstacle.model';
import ObstacleSprite from './ObstacleSprite.vue';
import ObstacleShadow from './ObstacleShadow.vue';
import { Container } from 'pixi.js';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { getScaleXForOrientation } from '@/utils/sprite';
import LightSource from '@/shared/scenes/LightSource.vue';

const { obstacle } = defineProps<{
  obstacle: ObstacleViewModel;
}>();

const camera = useIsoCamera();
const scaleX = computed(() => getScaleXForOrientation(obstacle.orientation, camera.angle.value));
</script>

<template>
  <AnimatedIsoPoint :position="obstacle.position" :z-index-offset="50">
    <LightSource :id="obstacle.id">
      <container :scale-x="scaleX">
        <ObstacleShadow :obstacle="obstacle" />
        <ObstacleSprite :obstacle="obstacle" />
      </container>
    </LightSource>
  </AnimatedIsoPoint>
</template>
