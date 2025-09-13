<script setup lang="ts">
import { onTick } from 'vue3-pixi';
import { useLights } from '../composables/useLightsManager';
import { AlphaFilter, Container, Texture } from 'pixi.js';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';

const camera = useIsoCamera();
const lights = useLights();
onTick(lights.onTick);

const ambientLightAlpha = new AlphaFilter();
ambientLightAlpha.blendMode = 'multiply';

const lightsContainer = computed({
  get: () => lights.container,
  set: val => {
    lights.container = val;
  }
});
const ambientLight = computed({
  get: () => lights.ambientLightContainer,
  set: val => {
    lights.ambientLightContainer = val;
  }
});
</script>

<template>
  <container
    event-mode="none"
    :filters="[ambientLightAlpha]"
    ref="lightsContainer"
    :z-index="999999"
  >
    <Sprite
      ref="ambientLight"
      :x="-camera.offset.value.x"
      :y="-camera.offset.value.y"
      :texture="Texture.WHITE"
      :scale="{
        x: camera.viewport.value?.worldWidth ?? 1,
        y: camera.viewport.value?.worldHeight ?? 1
      }"
    />
  </container>
</template>
